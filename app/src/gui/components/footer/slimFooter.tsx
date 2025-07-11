import {Container, Link, Stack, Typography, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React from 'react';

import SupportEmail from './supportEmail';
import {CONTACT_URL, PRIVACY_POLICY_URL} from '../../../buildconfig';

const SlimFooter = () => {
  /**
   * Slim footer with minimal necessary links to reduce user distraction
   * Obfuscate email address
   */
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{p: 1}}>
        <Stack
          direction={matchDownSM ? 'column' : 'row'}
          justifyContent={matchDownSM ? 'center' : 'space-between'}
          spacing={2}
          textAlign={matchDownSM ? 'center' : 'inherit'}
        >
          <Typography
            variant="subtitle2"
            color={theme.palette.grey[900]}
            component="span"
          >
            {/*&copy; FAIMS {new Date().getFullYear()}&nbsp;*/}
          </Typography>

          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            spacing={matchDownSM ? 1 : 3}
            textAlign={matchDownSM ? 'center' : 'inherit'}
          >
            <Typography
              variant="subtitle2"
              color={theme.palette.grey[900]}
              component={Link}
              href={PRIVACY_POLICY_URL}
              target="_blank"
              underline="none"
            >
              Privacy Policy
            </Typography>
            <SupportEmail />
            {CONTACT_URL && (
              <Typography
                variant="subtitle2"
                color={theme.palette.grey[900]}
                component={Link}
                href={CONTACT_URL}
                target="_blank"
                underline="none"
              >
                Contact
              </Typography>
            )}
          </Stack>
        </Stack>
      </Container>
    </React.Fragment>
  );
};

export default SlimFooter;
