import DashboardIcon from '@mui/icons-material/Dashboard';
import {
  Alert,
  AlertTitle,
  AppBar,
  Box,
  Button,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  NOTEBOOK_NAME,
  NOTEBOOK_NAME_CAPITALIZED,
  SHOW_RECORD_SUMMARY_COUNTS,
} from '../../../buildconfig';
import * as ROUTES from '../../../constants/routes';
import {getMetadataValue} from '../../../sync/metadata';
import {ProjectExtended} from '../../../types/project';
import {getUiSpecForProject} from '../../../uiSpecification';
import {
  useDraftsList,
  useQueryParams,
  useRecordList,
} from '../../../utils/customHooks';
import MetadataRenderer from '../metadataRenderer';
import CircularLoading from '../ui/circular_loading';
import AddRecordButtons from './add_record_by_type';
import DraftTabBadge from './draft_tab_badge';
import {DraftsTable} from './draft_table';
import {OverviewMap} from './overview_map';
import RangeHeader from './range_header';
import {RecordsTable} from './record_table';
import NotebookSettings from './settings';

// Define how tabs appear in the query string arguments, providing a two way map
type TabIndex = 'records' | 'details' | 'settings' | 'map';
const TAB_TO_INDEX = new Map<TabIndex, number>([
  ['records', 0],
  ['details', 1],
  ['settings', 2],
  ['map', 3],
]);
const INDEX_TO_TAB = new Map<number, TabIndex>(
  Array.from(TAB_TO_INDEX.entries()).map(([k, v]) => [v, k])
);

/**
 * TabPanelProps defines the properties for the TabPanel component.
 */
interface TabPanelProps {
  children?: React.ReactNode;
  id: string;
  index: number;
  value: number;
}

/**
 * TabPanel is a component for displaying the content of a specific tab.
 * It conditionally renders its children based on the active tab.
 *
 * @param {TabPanelProps} props - The properties for the TabPanel.
 * @returns {JSX.Element} - The JSX element for the TabPanel.
 */
function TabPanel(props: TabPanelProps) {
  const {children, id, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${id}-${index}`}
      aria-labelledby={`${id}-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/**
 * a11yProps returns accessibility properties for a tab.
 *
 * @param {number} index - The index of the tab.
 * @param {string} id - The id of the tab panel.
 * @returns {object} - The accessibility properties for the tab.
 */
function a11yProps(index: number, id: string) {
  /**
   * Accessibility props
   */
  return {
    id: `${id}-tab-${index}`,
    'aria-controls': `${id}-tabpanel-${index}`,
  };
}

/**
 * NotebookComponentProps defines the properties for the NotebookComponent component.
 */
type NotebookComponentProps = {
  project: ProjectExtended;
};

/**
 * NotebookComponent is a component that displays the main interface for the notebook.
 * It includes tabs for Records, Details, Access, Layers, and Settings.
 *
 * @param props - The properties for the NotebookComponent.
 * @returns The JSX element for the NotebookComponent.
 */
export default function NotebookComponent({project}: NotebookComponentProps) {
  // This manages the tab using a query string arg
  const {params, setParam} = useQueryParams<{tab: TabIndex}>({
    tab: {
      key: ROUTES.INDIVIDUAL_NOTEBOOK_ROUTE_TAB_Q,
      defaultValue: 'records',
    },
  });
  const notebookTabValue = TAB_TO_INDEX.get(params.tab ?? 'details') ?? 0;
  const setNotebookTabValue = (val: number) => {
    setParam('tab', INDEX_TO_TAB.get(val) ?? 'records');
  };

  const [tabIndex, setTabIndex] = React.useState<0 | 1 | 2>(0);

  // Fetch records from the (local) DB with 10 second auto refetch
  const [query, setQuery] = useState<string>('');
  const records = useRecordList({
    query: query,
    projectId: project.project_id,
    filterDeleted: true,
    // refetch every 10 seconds (local only fetch - no network traffic here)
    refreshIntervalMs: 10000,
  });
  const forceRecordRefresh = records.query.refetch;

  // Fetch drafts
  const drafts = useDraftsList({
    projectId: project.project_id,
    filter: 'all',
  });
  const forceDraftRefresh = drafts.refetch;

  // Query to get the ui spec
  const uiSpec = useQuery({
    queryKey: ['uispecquery', project.project_id],
    queryFn: async () => {
      return getUiSpecForProject(project.project_id);
    },
  });
  const viewsets = uiSpec.data?.viewsets;

  // Get the metadata for the template ID
  const {data: template_id} = useQuery({
    queryKey: ['project-template-id', project.project_id],
    queryFn: async (): Promise<string | null> => {
      // don't return undefined from queryFn
      const id = await getMetadataValue(project.project_id, 'template_id');
      if (id !== undefined) return id as string;
      else return null;
    },
  });

  /**
   * Handles the change event when the user switches between the Records and Drafts tabs.
   *
   * @param {React.SyntheticEvent} event - The event triggered by the tab change.
   * @param {number} newValue - The index of the selected tab.
   */
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: 0 | 1 | 2
  ) => {
    setTabIndex(newValue);
  };

  /**
   * Handles the change event when the user switches between the main tabs.
   *
   * @param {React.SyntheticEvent} event - The event triggered by the tab change.
   * @param {number} newValue - The index of the selected tab.
   */
  const handleNotebookTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setNotebookTabValue(newValue);
  };

  const theme = useTheme();
  const mq_above_md = useMediaQuery(theme.breakpoints.up('md'));
  const history = useNavigate();

  // recordLabel based on viewsets
  const recordLabel =
    uiSpec.data?.visible_types?.length === 1
      ? uiSpec.data?.viewsets[uiSpec.data.visible_types[0]]?.label ||
        uiSpec.data.visible_types[0]
      : 'Record';

  return (
    <Box>
      {uiSpec.isError ? (
        <Alert severity="error">
          <AlertTitle>
            {' '}
            {project.name} {NOTEBOOK_NAME} cannot sync right now.
          </AlertTitle>
          Your device may be offline.
          <br />
          <Typography variant={'caption'}>{uiSpec.error.message}</Typography>
          <br />
          <br />
          Go to
          <Button
            variant="text"
            size={'small'}
            onClick={() => history(ROUTES.INDEX)}
            startIcon={<DashboardIcon />}
          >
            Workspace
          </Button>
        </Alert>
      ) : uiSpec.isLoading || !uiSpec.data ? (
        <CircularLoading label={`${NOTEBOOK_NAME_CAPITALIZED} is loading`} />
      ) : (
        <Box>
          <Box
            mb={2}
            sx={{
              marginLeft: {sm: '-16px', md: 0},
              marginRight: {sm: '-16px', md: 0},
            }}
            component={Paper}
            elevation={0}
            variant={mq_above_md ? 'outlined' : 'elevation'}
          >
            <AppBar
              position="static"
              sx={{
                paddingLeft: '16px',
                backgroundColor: theme.palette.background.tabsBackground,
              }}
            >
              <Tabs
                value={notebookTabValue}
                onChange={handleNotebookTabChange}
                aria-label={`${NOTEBOOK_NAME} tabs`}
                indicatorColor="secondary"
                TabIndicatorProps={{
                  style: {
                    backgroundColor: theme.palette.secondary.contrastText,
                  },
                }}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  backgroundColor: theme.palette.background.tabsBackground,
                  width: '100%',
                  padding: '0 16px',
                }}
                textColor="inherit"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  label={`${recordLabel}s`}
                  {...a11yProps(0, NOTEBOOK_NAME)}
                />
                <Tab label="Details" {...a11yProps(1, NOTEBOOK_NAME)} />
                <Tab label="Settings" {...a11yProps(2, NOTEBOOK_NAME)} />
                <Tab label="Map" {...a11yProps(3, NOTEBOOK_NAME)} />
              </Tabs>
            </AppBar>
          </Box>

          {/* Records count summary - only if configured with VITE_SHOW_RECORD_SUMMARY_COUNTS */}
          {SHOW_RECORD_SUMMARY_COUNTS && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#EDEEEB',
                padding: '12px 16px',
                borderRadius: '4px',
                marginBottom: '16px',
              }}
            >
              <Typography variant="body2" sx={{fontSize: '1.1rem'}}>
                <strong>My {recordLabel}s:</strong> {records.myRecords.length}
              </Typography>

              <Typography variant="body2" sx={{fontSize: '1.1rem'}}>
                <strong>Other {recordLabel}s:</strong>{' '}
                {records.otherRecords.length}
              </Typography>
            </Box>
          )}

          <TabPanel value={notebookTabValue} index={0} id={'notebook'}>
            <Box>
              <AddRecordButtons project={project} recordLabel={recordLabel} />
            </Box>
            {/* Records/Drafts */}
            <Box mt={2}>
              <Box mb={1}>
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  aria-label={`${NOTEBOOK_NAME}-records`}
                  sx={{
                    backgroundColor: theme.palette.background.tabsBackground,
                  }}
                >
                  <Tab
                    label={`My ${recordLabel}s (${records.myRecords.length})`}
                    {...a11yProps(0, `${NOTEBOOK_NAME}-myrecords`)}
                  />
                  <Tab
                    label={`Other ${recordLabel}s (${records.otherRecords.length})`}
                    {...a11yProps(1, `${NOTEBOOK_NAME}-otherrecords`)}
                  />
                  <Tab
                    label={
                      <DraftTabBadge
                        loading={drafts.isLoading}
                        count={drafts.data?.length ?? 0}
                      />
                    }
                    {...a11yProps(2, `${NOTEBOOK_NAME}-drafts`)}
                  />
                </Tabs>
              </Box>
              <TabPanel value={tabIndex} index={0} id={'records-mine'}>
                <RecordsTable
                  project_id={project.project_id}
                  maxRows={25}
                  rows={records.myRecords}
                  loading={records.query.isLoading}
                  viewsets={viewsets}
                  handleQueryFunction={setQuery}
                  handleRefresh={forceRecordRefresh}
                  recordLabel={recordLabel}
                />
              </TabPanel>
              <TabPanel value={tabIndex} index={1} id={'records-all'}>
                <RecordsTable
                  project_id={project.project_id}
                  maxRows={25}
                  rows={records.otherRecords}
                  loading={records.query.isLoading}
                  viewsets={viewsets}
                  handleQueryFunction={setQuery}
                  handleRefresh={forceRecordRefresh}
                  recordLabel={recordLabel}
                />
              </TabPanel>
              <TabPanel value={tabIndex} index={2} id={'record-drafts'}>
                <DraftsTable
                  project_id={project.project_id}
                  maxRows={25}
                  rows={drafts.data ?? []}
                  loading={drafts.isLoading}
                  viewsets={viewsets}
                  handleRefresh={forceDraftRefresh}
                />
              </TabPanel>
            </Box>
          </TabPanel>

          <TabPanel value={notebookTabValue} index={1} id={'notebook'}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                px: 2,
              }}
            >
              {/* <Box
                component="h2"
                sx={{
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                }}
              >
                Survey Details
              </Box> */}
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  flexGrow: 1,
                }}
              >
                Survey Details
              </Typography>

              {/* Unhide the edit button when the notebook cna be edited */}
              {/* <IconButton
                color="primary"
                aria-label="edit"
                onClick={() => {
                  console.log('Edit Survey Details clicked');
                }}
                sx={{display: 'flex', alignItems: 'center'}}
              >
                <EditIcon />
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{marginLeft: '4px'}}
                >
                  Edit
                </Typography>
              </IconButton> */}
            </Box>

            <Box sx={{p: 2}}>
              <Typography
                variant="body1"
                gutterBottom
                sx={{marginBottom: '16px'}}
              >
                <strong>Name:</strong>{' '}
                <MetadataRenderer
                  project_id={project.project_id}
                  metadata_key={'name'}
                  chips={false}
                />
              </Typography>
              {template_id && (
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{marginBottom: '16px'}}
                >
                  <strong>Template Used: </strong>
                  <span>{template_id}</span>
                </Typography>
              )}
              <Typography
                variant="body1"
                gutterBottom
                component="div"
                sx={{marginBottom: '16px'}}
              >
                <strong>Description:</strong>{' '}
                <MetadataRenderer
                  project_id={project.project_id}
                  metadata_key={'pre_description'}
                  chips={false}
                />
              </Typography>

              <Typography
                variant="body1"
                gutterBottom
                sx={{marginBottom: '16px'}}
              >
                <strong>Lead Institution:</strong>{' '}
                <MetadataRenderer
                  project_id={project.project_id}
                  metadata_key={'lead_institution'}
                  chips={false}
                />
              </Typography>
              <Typography
                variant="body1"
                gutterBottom
                sx={{marginBottom: '16px', textAlign: 'left'}}
              >
                <strong>Project Lead:</strong>{' '}
                <MetadataRenderer
                  project_id={project.project_id}
                  metadata_key={'project_lead'}
                  chips={false}
                />
              </Typography>
            </Box>
            <Grid container spacing={{xs: 1, sm: 2, md: 3}}>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <Box component={Paper} elevation={0} variant={'outlined'} p={2}>
                  <Typography variant={'h6'} sx={{mb: 2}}>
                    Description
                  </Typography>
                  <Typography variant="body2" color="textPrimary" gutterBottom>
                    <MetadataRenderer
                      project_id={project.project_id}
                      metadata_key={'pre_description'}
                      chips={false}
                    />
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  variant={'outlined'}
                >
                  <Typography variant={'h6'} sx={{m: 2}} gutterBottom>
                    About
                  </Typography>
                  <Table size={'small'}>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Typography variant={'overline'}>Status</Typography>
                        </TableCell>
                        <TableCell>
                          <MetadataRenderer
                            project_id={project.project_id}
                            metadata_key={'project_status'}
                            chips={false}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant={'overline'}>
                            Lead Institution
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <MetadataRenderer
                            project_id={project.project_id}
                            metadata_key={'lead_institution'}
                            chips={false}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant={'overline'}>
                            Project Lead
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <MetadataRenderer
                            project_id={project.project_id}
                            metadata_key={'project_lead'}
                            chips={false}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant={'overline'}>
                            Last Updated
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <MetadataRenderer
                            project_id={project.project_id}
                            metadata_key={'last_updated'}
                            chips={false}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={4}>
                <RangeHeader
                  project={project}
                  handleAIEdit={handleNotebookTabChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={notebookTabValue} index={2} id={'notebook'}>
            {uiSpec !== null && <NotebookSettings uiSpec={uiSpec.data} />}
          </TabPanel>

          <TabPanel value={notebookTabValue} index={3} id={'notebook'}>
            {uiSpec !== null && (
              <OverviewMap
                project_id={project.project_id}
                uiSpec={uiSpec.data}
              />
            )}
          </TabPanel>
        </Box>
      )}
    </Box>
  );
}
