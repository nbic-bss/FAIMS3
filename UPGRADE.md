# Upgrades/Migrations

This document will describe the necessary steps to migrate existing deployments through versions of FAIMS.

## [feat: admin forgot password reset workflow](https://github.com/FAIMS/FAIMS3/pull/1334)

### CouchDB migration

This functionality will not work until you apply the following migration

- setup npm env cd /api && npm i
- run the migrate action `npm run migrate`
- Try generating a code and make sure the workflow is functional.

**Note** If you are running inside a container, then the above command needs to be
run in the container rather than from your local environment:

```bash
docker compose exec conductor npm run migrate
```

### Deployment configuration

Add the new `NEW_CONDUCTOR_URL` environment variable to the conductor/api build. This is already done in the aws-cdk IaC - however in existing deployments you may need to update your build configuration.

**Note** ensure this includes the https:// prefix!

This is a mandatory property and not including it will break the deployment.

## [feat: permissions, db, migrations overhaul](https://github.com/FAIMS/FAIMS3/pull/1380)

After deployment, the system will likely not function until the DB migration is run. To run the migration:

### Setup your environment

- ensure your environment is updated/installed - I'd recommend a cleanse and then rebuild e.g. from `FAIMS3` root of repo `./scripts/purge.sh . && npm i && npx turbo build```
- setup a working local dev environment for `api`
- ensure the `.env` of your API is accurately configured for the target deployment (being careful of secrets here)

### Run the migration command

- run the migration command `npm run migrate`

**Note** If you are running inside a container, then the above command needs to be
run in the container rather than from your local environment:

```bash
docker compose exec conductor npm run migrate
```

You should see output indicating that a) the invites DB has been migrated without errors b) the people DB has been migrated without errors. If either fails, login to your couchDB and interrogate the migration DB logs.

### Force the migration to run

If needed, you can login to your `/_utils` fauxton instance of CouchDB, then navigate to the Migrations DB.
Find the migration document for the target DB, and update the `version` field to reflect what
you want the migration system to think the database version is.
