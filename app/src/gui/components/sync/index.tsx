/*
 * Copyright 2021, 2022 Macquarie University
 *
 * Licensed under the Apache License Version 2.0 (the, "License");
 * you may not use, this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND either express or implied.
 * See, the License, for the specific language governing permissions and
 * limitations under the License.
 *
 * Filename: syncStatus.tsx
 * Description:
 *   This contains the syncStatus React component, which allows users to see their device's sync status
 */
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import {grey} from '@mui/material/colors';
import 'animate.css';
import moment from 'moment';
import React, {useEffect, useRef} from 'react';
import {shallowEqual} from 'react-redux';
import {useAppSelector} from '../../../context/store';

// custom hook for getting previous value
function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
export default function SyncStatus() {
  /**
   * sync_up(), sync_down() and sync_both()
   * States: isSyncingUp, isSyncingDown, isSynced
   * Icons:
   *    isSyncingUp true => CloudUploadIcon
   *    isSyncingDown true => isSyncingDown
   *    isSynced true => CloudDoneIcon
   *    isSynced false => ??
   *
   * Sync status depending on global state.
   * state.isSyncError =>  <CloudOffIcon />
   * state.isSyncingUp =>  <CloudIcon /> + <ArrowDropUpIcon/>
   * state.isSyncingDown =>  <CloudIcon /> + <ArrowDropDownIcon/>
   * state.hasUnsyncedChanges =>  <CloudQueueIcon /> <--- not currently in use
   *
   */

  // decompose state into fields we want - then do shallow equality so that we
  // don't rerender on every store change due to object creation
  const {isSyncError, isSyncingUp, isSyncingDown} = useAppSelector(
    state => ({
      isSyncError: state.sync.isSyncError,
      isSyncingUp: state.sync.isSyncingUp,
      isSyncingDown: state.sync.isSyncingDown,
    }),
    shallowEqual
  );

  const LAST_SYNC_FORMAT = 'MMMM Do YYYY, LTS';
  const [lastSync, setLastSync] = React.useState(
    moment().format(LAST_SYNC_FORMAT)
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;
  const prevSync = usePrevious({
    up: isSyncingUp,
    down: isSyncingDown,
  });

  useEffect(() => {
    setLastSync(moment().format(LAST_SYNC_FORMAT));
  }, [prevSync]);

  return (
    <React.Fragment>
      <Button
        aria-describedby={id}
        variant="text"
        type={'button'}
        onClick={handleClick}
        sx={{p: 0}}
      >
        <Box
          sx={{
            justifyContent: 'center',
            position: 'relative',
            display: ' inline-flex',
            alignItems: 'center',
            verticalAlign: 'middle',
            mx: 2,
            width: '40px',
          }}
        >
          <Box display="flex" justifyContent="center" sx={{height: '100%'}}>
            {isSyncError ? (
              <React.Fragment>
                <CloudOffIcon
                  style={{marginLeft: '11px'}}
                  sx={{color: 'primary'}}
                />
                <ErrorIcon
                  style={{fontSize: '20px', marginTop: '-5px'}}
                  color={'warning'}
                />
              </React.Fragment>
            ) : isSyncingUp || isSyncingDown ? (
              <CloudIcon sx={{color: 'primary'}} />
            ) : (
              <CloudQueueIcon sx={{color: 'primary'}} />
            )}
          </Box>
          {!isSyncError ? (
            <Grid
              container
              style={{
                marginLeft: '-32px',
                maxHeight: '64px',
                marginBottom: '-3px',
              }}
              spacing={0}
            >
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                  <ArrowDropUpIcon
                    sx={{fontSize: '32px'}}
                    color={!isSyncingUp ? 'disabled' : 'warning'}
                    className={
                      isSyncingUp
                        ? 'animate__animated animate__flash animate__slow animate__infinite'
                        : ''
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                  <ArrowDropDownIcon
                    sx={{fontSize: '32px'}}
                    color={!isSyncingDown ? 'disabled' : 'warning'}
                    className={
                      isSyncingDown
                        ? 'animate__animated animate__flash animate__slow animate__infinite'
                        : ''
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          ) : (
            ''
          )}
        </Box>
      </Button>
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <Card variant="outlined">
          <CardContent sx={{p: 0, paddingBottom: '0 !important'}}>
            <CardHeader
              title={'Sync Status'}
              sx={{textAlign: 'center', backgroundColor: grey[200], p: 1}}
            />
            <TableContainer component={Paper} elevation={0}>
              <Table
                sx={{maxWidth: 250, fontSize: 14, mb: 0}}
                aria-label="sync table"
                size={'small'}
              >
                <TableBody>
                  <TableRow>
                    <TableCell sx={{verticalAlign: 'top'}}>Status</TableCell>
                    <TableCell sx={{verticalAlign: 'top', textAlign: 'right'}}>
                      <Typography color="text.secondary" sx={{fontSize: 14}}>
                        {isSyncError
                          ? 'Error'
                          : isSyncingUp || isSyncingDown
                            ? 'In Progress'
                            : 'Idle'}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        gutterBottom
                        variant={'caption'}
                      >
                        {isSyncError
                          ? 'Cannot sync to server, your device may be offline.'
                          : isSyncingUp || isSyncingDown
                            ? 'Sync is underway'
                            : 'Waiting for changes'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{verticalAlign: 'top'}}>Last Sync</TableCell>
                    <TableCell sx={{verticalAlign: 'top', textAlign: 'right'}}>
                      <Typography
                        color="text.secondary"
                        gutterBottom
                        sx={{fontSize: 14}}
                      >
                        {lastSync}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Popper>
    </React.Fragment>
  );
}
