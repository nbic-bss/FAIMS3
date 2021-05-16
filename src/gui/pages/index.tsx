import React from 'react';
import {NavLink} from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import {
  Box,
  Grid,
  Container,
  Breadcrumbs,
  Typography,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
} from '@material-ui/core';
import AccountTree from '@material-ui/icons/AccountTree';
import HomeIcon from '@material-ui/icons/Home';
import DescriptionIcon from '@material-ui/icons/Description';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
type IndexProps = {
  // project: string;
};

type IndexState = {};

export class Index extends React.Component<IndexProps, IndexState> {
  constructor(props: IndexProps) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="row-reverse"
          p={1}
          m={1}
          // bgcolor="background.paper"
        >
          <Breadcrumbs aria-label="breadcrumb">
            {/*<NavLink to={ROUTES.INDEX}>/</NavLink>*/}
            <Typography color="textPrimary">Index</Typography>
          </Breadcrumbs>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4}>
            <img src="static/FAIMS.png" />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Paper>
              <MenuList>
                <MenuItem component={NavLink} to={ROUTES.SIGN_IN}>
                  <ListItemIcon>
                    <AccountBoxIcon fontSize="small" />
                  </ListItemIcon>
                  Sign In
                </MenuItem>
                <MenuItem component={NavLink} to={ROUTES.SIGN_UP}>
                  <ListItemIcon>
                    <PersonAddIcon fontSize="small" />
                  </ListItemIcon>
                  Sign Up
                </MenuItem>
                <MenuItem component={NavLink} to={ROUTES.FORGOT_PASSWORD}>
                  <ListItemIcon>
                    <LockOpenIcon fontSize="small" />
                  </ListItemIcon>
                  Forgot Password
                </MenuItem>
              </MenuList>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Paper>
              <MenuList>
                <MenuItem component={NavLink} to={ROUTES.HOME}>
                  <ListItemIcon>
                    <HomeIcon fontSize="small" />
                  </ListItemIcon>
                  Home
                </MenuItem>
                <MenuItem component={NavLink} to={ROUTES.PROJECT_LIST}>
                  <ListItemIcon>
                    <AccountTree fontSize="small" />
                  </ListItemIcon>
                  Projects
                </MenuItem>
                <MenuItem component={NavLink} to={ROUTES.OBSERVATION_LIST}>
                  <ListItemIcon>
                    <DescriptionIcon fontSize="small" />
                  </ListItemIcon>
                  Observations
                </MenuItem>
              </MenuList>
            </Paper>
            <Box mt={2}>
              <Paper>
                <MenuList>
                  <MenuItem component={NavLink} to={ROUTES.DUMMY}>
                    <ListItemIcon>
                      <DeveloperModeIcon fontSize="small" />
                    </ListItemIcon>
                    Previous dev content
                  </MenuItem>
                </MenuList>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }
}