/*
 * Created Date: Thursday July 25th 2024 Author: Peter Baker
 * -----
 * Last Modified: Thursday July 25th 2024 10:09:45 am Modified By: Peter Baker
 * -----
 * Description: Uses an EC2 Auto Scaling group with some user data to configure
 * a single CouchDB node. Uses a load balancer for TLS. Exposes load balancer to
 * public traffic but not the couchDB directly.
 * -----
 * HISTORY: Date         By  Comments
 * ----------   --- ---------------------------------------------------------
 */

import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as r53targets from "aws-cdk-lib/aws-route53-targets";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { SharedBalancer } from "./networking";

/**
 * Properties for the EC2CouchDB construct
 */
export interface EC2CouchDBProps {
  /** The VPC to deploy the CouchDB instance in */
  vpc: ec2.IVpc;
  /** The domain name for the CouchDB instance */
  domainName: string;
  /** The shared Application Load Balancer to use */
  sharedBalancer: SharedBalancer;
  /** The Hosted Zone for DNS configuration */
  hz: route53.IHostedZone;
  /** The SSL/TLS certificate for HTTPS connections */
  certificate: acm.ICertificate;
}

/**
 * A construct that sets up a CouchDB instance on EC2 with auto-scaling and load balancing
 */
export class EC2CouchDB extends Construct {
  /** The public endpoint for accessing CouchDB */
  public readonly couchEndpoint: string;
  /** The exposed HTTPS port */
  public readonly exposedPort: number = 443;
  /** The secret containing the CouchDB admin user/password */
  public readonly passwordSecret: secretsmanager.Secret;
  /** The internal port CouchDB listens on */
  private readonly couchInternalPort: number = 5984;

  /** CouchDB configuration settings */
  private readonly couchDbConfig: string = `
; CouchDB Configuration Settings for FAIMS
[couchdb]
max_document_size = 4294967296 ; bytes
os_process_timeout = 5000 ; 5 sec
uuid = adf990d5dd21b735f65d4140ad1f10c2
single_node=true

[chttpd]
port = 5984
bind_address = 0.0.0.0
authentication_handlers = {chttpd_auth, cookie_authentication_handler}, {chttpd_auth, jwt_authentication_handler}, {chttpd_auth, default_authentication_handler}

[httpd]
enable_cors = true

[log]
writer = syslog
level = info

[chttpd_auth]
secret = db7a1a86dbc734593febf8ca6fdf0cf8

[cors]
origins = *
headers = accept, authorization, content-type, origin, referer
credentials = true
methods = GET, PUT, POST, HEAD, DELETE
  `.trim();

  constructor(scope: Construct, id: string, props: EC2CouchDBProps) {
    super(scope, id);

    // AUXILIARY SETUP
    // ================

    // Create a secret for the CouchDB admin password
    this.passwordSecret = new secretsmanager.Secret(
      this,
      "CouchDBAdminPassword",
      {
        generateSecretString: {
          excludeCharacters: '/\\"%@',
          generateStringKey: "password",
          passwordLength: 16,
          secretStringTemplate: JSON.stringify({ username: "admin" }),
        },
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    // CLOUDMAP SETUP
    // ================

    // Create CloudMap service for service discovery
    const namespace = new servicediscovery.PrivateDnsNamespace(
      this,
      "CouchDBNamespace",
      {
        vpc: props.vpc,
        name: "couchdb.local",
      }
    );

    const service = namespace.createService("CouchDBService", {
      dnsRecordType: servicediscovery.DnsRecordType.A,
      dnsTtl: Duration.seconds(60),
    });

    // Create a dead-letter queue for failed deregistrations
    const dlq = new sqs.Queue(this, "DeregistrationDLQ");

    // Lambda function to deregister instances from CloudMap on termination
    const deregisterLambda = new lambda.Function(
      this,
      "DeregisterInstanceLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("src/deregister-lambda/dist"),
        environment: {
          SERVICE_ID: service.serviceId,
        },
        deadLetterQueue: dlq,
      }
    );

    // INSTANCE CONFIG
    // ================

    // Create user data script to install and configure CouchDB
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      // Update yum and install dependencies
      "yum update -y",
      "yum install -y docker jq awscli",
      // Run CouchDB with docker service
      "systemctl start docker",
      "systemctl enable docker",
      "docker pull couchdb:latest",
      "SECRET_ARN=" + this.passwordSecret.secretArn,
      // Get the region dynamically
      "REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)",
      "export AWS_DEFAULT_REGION=$REGION",
      // Get username and password from Secrets Manager
      "ADMIN_PASSWORD=$(aws secretsmanager get-secret-value --secret-id $SECRET_ARN --query SecretString --output text | jq -r .password)",
      "ADMIN_USER=$(aws secretsmanager get-secret-value --secret-id $SECRET_ARN --query SecretString --output text | jq -r .username)",
      // Create CouchDB configuration file
      "mkdir -p /opt/couchdb/etc/local.d",
      `cat > /opt/couchdb/etc/local.d/local.ini << EOL
${this.couchDbConfig}
EOL`,
      // Append admin and password configuration to local.ini
      `echo "[admins]" >> /opt/couchdb/etc/local.d/local.ini`,
      `echo "$ADMIN_USER = $ADMIN_PASSWORD" >> /opt/couchdb/etc/local.d/local.ini`,
      // Run CouchDB container with mounted configuration
      "docker run -d --name couchdb -p 5984:5984 -v /opt/couchdb/etc/local.d:/opt/couchdb/etc/local.d couchdb:latest",
      // Register the instance with CloudMap
      'TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")',
      'INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)',
      'PRIVATE_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/local-ipv4)',
      "SERVICE_ID=" + service.serviceId,
      `aws servicediscovery register-instance --service-id $SERVICE_ID --instance-id $INSTANCE_ID --attributes AWS_INSTANCE_IPV4=$PRIVATE_IP,AWS_INSTANCE_PORT=5984`
    );

    // ASG SETUP
    // ================

    // Create a security group for the EC2 instance
    const couchSecurityGroup = new ec2.SecurityGroup(
      this,
      "CouchDBSecurityGroup",
      {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: "Security group for CouchDB EC2 instances",
      }
    );

    // Create an Auto Scaling Group with a single EC2 instance
    const asg = new autoscaling.AutoScalingGroup(this, "CouchDBAsg", {
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.SMALL
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userData,
      minCapacity: 1,
      maxCapacity: 1,
      desiredCapacity: 1,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      associatePublicIpAddress: true,
      securityGroup: couchSecurityGroup,
      updatePolicy: autoscaling.UpdatePolicy.rollingUpdate(),
    });

    // LIFECYCLE CONFIG
    // ================

    // Add lifecycle hook to deregister instances from CloudMap on termination
    asg.addLifecycleHook("DeregisterFromCloudMap", {
      lifecycleTransition: autoscaling.LifecycleTransition.INSTANCE_TERMINATING,
      heartbeatTimeout: Duration.seconds(300),
      defaultResult: autoscaling.DefaultResult.CONTINUE,
    });

    // Trigger deregister Lambda when instance termination occurs
    new events.Rule(this, "TerminatingInstanceRule", {
      eventPattern: {
        source: ["aws.autoscaling"],
        detailType: ["EC2 Instance-terminate Lifecycle Action"],
        detail: {
          AutoScalingGroupName: [asg.autoScalingGroupName],
        },
      },
      targets: [new targets.LambdaFunction(deregisterLambda)],
    });

    // LOAD BALANCING SETUP
    // =========================

    // Create the target group for the CouchDB instances
    const tg = new elb.ApplicationTargetGroup(this, "CouchTG", {
      port: this.couchInternalPort,
      protocol: elb.ApplicationProtocol.HTTP,
      targetType: elb.TargetType.INSTANCE,
      healthCheck: {
        enabled: true,
        healthyHttpCodes: "200",
        protocol: elb.Protocol.HTTP,
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        port: this.couchInternalPort.toString(),
        path: "/",
      },
      vpc: props.vpc,
    });

    // Add the Auto Scaling Group to the target group
    tg.addTarget(asg);

    // Add HTTP redirected HTTPS service to ALB against target group
    props.sharedBalancer.addHttpRedirectedConditionalHttpsTarget(
      "couch",
      tg,
      [elb.ListenerCondition.hostHeaders([props.domainName])],
      110, // TODO: Understand and consider priorities
      110
    );

    // DNS ROUTES
    // ===========

    // Create a DNS record for the CouchDB endpoint
    new route53.ARecord(this, "CouchDBAliasRecord", {
      zone: props.hz,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new r53targets.LoadBalancerTarget(props.sharedBalancer.alb)
      ),
    });

    // DEBUG CONFIG
    // ============

    // TODO: Handle this through config
    const debugInstancePermissions = false;

    if (debugInstancePermissions) {
      // For debugging CouchDB instances - allow inbound traffic for SSM Instance Connect
      couchSecurityGroup.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcp(443),
        "Allow SSM Instance Connect"
      );

      // Add SSM Instance Connect permissions to the instance role
      asg.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        )
      );
    }

    // IAM PERMISSIONS
    // ==================

    // Grant the EC2 instance permission to read the secret
    this.passwordSecret.grantRead(asg.role);

    // Service discovery permissions
    const permsForServiceDiscovery = [
      "servicediscovery:DeregisterInstance",
      "servicediscovery:DiscoverInstances",
      "servicediscovery:RegisterInstance",
      "route53:GetHealthCheck",
      "route53:DeleteHealthCheck",
      "route53:CreateHealthCheck",
      "route53:UpdateHealthCheck",
      "route53:ChangeResourceRecordSets",
      "ec2:DescribeInstances",
    ];

    // Grant the EC2 instance permission to register and deregister instances in the service
    asg.addToRolePolicy(
      new iam.PolicyStatement({
        actions: permsForServiceDiscovery,
        resources: ["*"], // TODO: Tighten this and split by service
      })
    );

    // Grant the Lambda function permissions for service discovery and lifecycle completion
    deregisterLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          ...permsForServiceDiscovery,
          "autoscaling:CompleteLifecycleAction",
        ],
        resources: ["*"], // TODO: Tighten this and split by service
      })
    );

    // Grant the Lambda function permission to complete lifecycle actions
    deregisterLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["autoscaling:CompleteLifecycleAction"],
        resources: [asg.autoScalingGroupArn],
      })
    );

    // NETWORK SECURITY
    // ================

    // Allow inbound traffic from the ALB to the CouchDB instances
    couchSecurityGroup.connections.allowFrom(
      props.sharedBalancer.alb,
      ec2.Port.tcp(this.couchInternalPort),
      "Allow traffic from ALB to CouchDB instances"
    );

    // OUTPUTS
    // ================

    // Set the public endpoint for CouchDB
    this.couchEndpoint = `https://${props.domainName}:${this.exposedPort}`;
  }
}