import styled from '@emotion/styled';
import {Action, ProjectStatus} from '@faims3/data-model';
import {
  Alert,
  AlertTitle,
  AppBar,
  Box,
  Paper,
  Tab,
  Tabs,
  TabScrollButton,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {NOTEBOOK_NAME, NOTEBOOK_NAME_CAPITALIZED} from '../../../buildconfig';
import * as ROUTES from '../../../constants/routes';
import {compiledSpecService} from '../../../context/slices/helpers/compiledSpecService';
import {Project, selectProjectById} from '../../../context/slices/projectSlice';
import {useAppSelector} from '../../../context/store';
import {getVisibleTypes} from '../../../uiSpecification';
import {
  invalidateProjectHydration,
  invalidateProjectRecordList,
  useDraftsList,
  useIsAuthorisedTo,
  useQueryParams,
  useRecordList,
} from '../../../utils/customHooks';
import CircularLoading from '../ui/circular_loading';
import AddRecordButtons from './add_record_by_type';
import {DraftsTable} from './draft_table';
import {MetadataDisplayComponent} from './MetadataDisplay';
import {OverviewMap} from './overview_map';
import {RecordsTable} from './record_table';
import NotebookSettings from './settings';
import {useRecordAudit} from '../../../utils/apiHooks/notebooks';
import {selectActiveUser} from '../../../context/slices/authSlice';

// Define how tabs appear in the query string arguments, providing a two way map
type TabIndexLabel =
  | 'my_records'
  | 'drafts'
  | 'other_records'
  | 'details'
  | 'settings'
  | 'map';
type TabIndex = 0 | 1 | 2 | 3 | 4 | 5;
const TAB_TO_INDEX = new Map<TabIndexLabel, TabIndex>([
  ['my_records', 0],
  ['drafts', 1],
  ['other_records', 2],
  ['details', 3],
  ['settings', 4],
  ['map', 5],
]);
const INDEX_TO_TAB = new Map<TabIndex, TabIndexLabel>(
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

const MyTabScrollButton = styled(TabScrollButton)({
  '&.Mui-disabled': {
    width: 0,
  },
  overflow: 'hidden',
  transition: 'width 0.3s',
  width: 25,
  marginLeft: 0,
});

/**
 * NotebookComponentProps defines the properties for the NotebookComponent component.
 */
type NotebookComponentProps = {
  project: Project;
};

/**
 * NotebookComponent is a component that displays the main interface for the notebook.
 * It includes tabs for Records, Details, Access, Layers, and Settings.
 *
 * @param props - The properties for the NotebookComponent.
 * @returns The JSX element for the NotebookComponent.
 */
export default function NotebookComponent({project}: NotebookComponentProps) {
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.up('md'));
  const queryClient = useQueryClient();

  const isAllowedToAddRecords =
    useIsAuthorisedTo({
      action: Action.CREATE_PROJECT_RECORD,
      resourceId: project.projectId,
    }) && project.status === ProjectStatus.OPEN;

  const {uiSpecificationId} = project;
  const uiSpecification = compiledSpecService.getSpec(uiSpecificationId);
  if (!uiSpecification) {
    return <CircularLoading label="Loading" />;
  }

  const activeUser = useAppSelector(selectActiveUser);

  // get the sync status of records in this project
  const recordStatus = useRecordAudit({
    projectId: project.projectId,
    listingId: project.serverId,
    username: activeUser?.username ?? '',
  });

  // This manages the tab using a query string arg
  const {params, setParam} = useQueryParams<{tab: TabIndexLabel}>({
    tab: {
      key: ROUTES.INDIVIDUAL_NOTEBOOK_ROUTE_TAB_Q,
      defaultValue: 'my_records',
    },
  });

  // This is the actual tab index state
  const [tabIndex, setTabIndex] = React.useState<TabIndex>(
    TAB_TO_INDEX.get(params.tab ?? 'my_records') ??
      TAB_TO_INDEX.get('my_records') ??
      0
  );

  // This is a function which updates the param based on the tab index
  const setTabValue = (val: TabIndex) => {
    setParam('tab', INDEX_TO_TAB.get(val) ?? 'my_records');
  };

  // Fetch records from the (local) DB with configurable auto refetch
  const [query, setQuery] = useState<string>('');
  const records = useRecordList({
    query: query,
    projectId: project.projectId,
    filterDeleted: true,
    // refetch every 10 seconds (local only fetch - no network traffic here)
    metadataRefreshIntervalMs: 10000,
    // rehydrate every 2 minutes (local only fetch - no network traffic here)
    hydrationRefreshIntervalMs: 120000,
    uiSpecification: uiSpecification,
  });
  const forceRecordRefresh = records.initialQuery.refetch;

  // Fetch drafts
  const drafts = useDraftsList({
    projectId: project.projectId,
    filter: 'all',
  });
  const forceDraftRefresh = drafts.refetch;

  const viewsets = uiSpecification.viewsets;

  const templateId = useAppSelector(
    state =>
      selectProjectById(state, project.projectId)?.metadata?.['template_id'] as
        | string
        | undefined
  );

  /**
   * Handles the change event when the user switches between the tabs.
   *
   * @param {React.SyntheticEvent} event - The event triggered by the tab
   * change.
   * @param {number} newValue - The index of the selected tab.
   */
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TabIndex
  ) => {
    // Set the actual index on tab change
    setTabIndex(newValue);
    // Update the param
    setTabValue(newValue);
  };

  // recordLabel based on viewsets
  const recordLabel =
    uiSpecification.visible_types?.length === 1
      ? uiSpecification.viewsets[uiSpecification.visible_types[0]]?.label ||
        uiSpecification.visible_types[0]
      : 'Record';

  const visibleTypes = getVisibleTypes(uiSpecification);
  const visibleMyRecords = records.myRecords.filter(r =>
    visibleTypes.includes(r.type)
  );
  const visibleOtherRecords = records.otherRecords.filter(r =>
    visibleTypes.includes(r.type)
  );

  return (
    <Box>
      {project.status === ProjectStatus.CLOSED && (
        <Alert variant="standard" severity="warning" sx={{mb: 1}}>
          <AlertTitle>{NOTEBOOK_NAME_CAPITALIZED} is closed</AlertTitle>
          This {NOTEBOOK_NAME} is <b>closed</b>. Your existing records can be
          uploaded, but no additional data can be collected. It is recommended
          to deactivate this {NOTEBOOK_NAME} in the settings tab below.
        </Alert>
      )}
      <Box>
        {isAllowedToAddRecords && (
          <Box sx={{mb: 1.5}}>
            <AddRecordButtons
              project={project}
              recordLabel={recordLabel}
              refreshList={() => {
                invalidateProjectRecordList({
                  client: queryClient,
                  projectId: project.projectId,
                  reset: true,
                });
                invalidateProjectHydration({
                  client: queryClient,
                  projectId: project.projectId,
                  reset: true,
                });
              }}
            />
          </Box>
        )}
        <Box
          mb={2}
          sx={{
            marginLeft: {sm: '-16px', md: 0},
            marginRight: {sm: '-16px', md: 0},
          }}
          component={Paper}
          elevation={0}
          variant={isMedium ? 'outlined' : 'elevation'}
        >
          <AppBar
            position="static"
            sx={{
              paddingLeft: '16px',
              backgroundColor: theme.palette.background.tabsBackground,
            }}
          >
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              aria-label={`${NOTEBOOK_NAME} tabs`}
              indicatorColor="secondary"
              TabIndicatorProps={{
                style: {
                  backgroundColor: theme.palette.secondary.contrastText,
                },
              }}
              sx={{
                backgroundColor: theme.palette.background.tabsBackground,
                justifyItems: 'space-between',

                // Make more compact if needed

                '& .MuiTab-root': !isMedium
                  ? {
                      // Target all tabs
                      padding: '3px 6px', // Reduce default padding (normally 12px 16px)
                      minWidth: 'auto', // Override default min-width
                      fontSize: '0.8rem',
                      marginRight: '2px',
                      marginLeft: '2px',
                    }
                  : {},
              }}
              ScrollButtonComponent={MyTabScrollButton}
              textColor="inherit"
              variant="scrollable"
              scrollButtons={true}
              allowScrollButtonsMobile={true}
            >
              <Tab
                label={`My ${recordLabel}s (${visibleMyRecords.length})`}
                value={0}
                {...a11yProps(0, `${NOTEBOOK_NAME}-myrecords`)}
              />
              {(tabIndex === 1 || (drafts.data?.length ?? 0) > 0) && (
                <Tab
                  value={1}
                  label={`Drafts (${drafts.data?.length ?? 0})`}
                  {...a11yProps(1, `${NOTEBOOK_NAME}-drafts`)}
                />
              )}

              {(tabIndex === 2 || visibleOtherRecords.length > 0) && (
                <Tab
                  value={2}
                  label={`Other ${recordLabel}s (${visibleOtherRecords.length})`}
                  {...a11yProps(2, `${NOTEBOOK_NAME}-otherrecords`)}
                />
              )}

              <Tab value={3} label="Details" {...a11yProps(3, NOTEBOOK_NAME)} />
              <Tab
                value={4}
                label="Settings"
                {...a11yProps(4, NOTEBOOK_NAME)}
              />
              <Tab value={5} label="Map" {...a11yProps(5, NOTEBOOK_NAME)} />
            </Tabs>
          </AppBar>
        </Box>

        {
          // My records
        }
        <TabPanel value={tabIndex} index={0} id={'records-mine'}>
          <RecordsTable
            project={project}
            maxRows={25}
            rows={records.myRecords}
            loading={records.initialQuery.isLoading}
            viewsets={viewsets}
            handleQueryFunction={setQuery}
            handleRefresh={forceRecordRefresh}
            recordLabel={recordLabel}
            recordStatus={recordStatus.data}
          />
        </TabPanel>
        {
          // Drafts
        }

        <TabPanel value={tabIndex} index={1} id={'record-drafts'}>
          <DraftsTable
            project_id={project.projectId}
            serverId={project.serverId}
            maxRows={25}
            rows={drafts.data ?? []}
            loading={drafts.isLoading}
            viewsets={viewsets}
            handleRefresh={forceDraftRefresh}
          />
        </TabPanel>
        {
          // Other records
        }

        <TabPanel value={tabIndex} index={2} id={'records-all'}>
          <RecordsTable
            project={project}
            maxRows={25}
            rows={records.otherRecords}
            loading={records.initialQuery.isLoading}
            viewsets={viewsets}
            handleQueryFunction={setQuery}
            handleRefresh={forceRecordRefresh}
            recordLabel={recordLabel}
            recordStatus={recordStatus.data}
          />
        </TabPanel>

        <TabPanel value={tabIndex} index={3} id={'details'}>
          <MetadataDisplayComponent
            handleTabChange={(index: number) => setTabIndex(index as TabIndex)}
            project={project}
            templateId={templateId}
          />
        </TabPanel>

        <TabPanel value={tabIndex} index={4} id={'settings'}>
          <NotebookSettings uiSpec={uiSpecification} />
        </TabPanel>

        <TabPanel value={tabIndex} index={5} id={'map'}>
          {uiSpecification !== null && (
            <OverviewMap
              serverId={project.serverId}
              records={records}
              project_id={project.projectId}
              uiSpec={uiSpecification}
            />
          )}
        </TabPanel>
      </Box>
    </Box>
  );
}
