import {
  Card,
  CardContent,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import {
  Content,
  Header,
  InfoCard,
  Page,
  Table,
  TableColumn,
} from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  metricValue: {
    fontSize: '2rem',
    fontWeight: 700,
    marginTop: theme.spacing(1),
  },
  metricHint: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
}));

const METRICS = [
  { title: 'Lead Time', value: '18h', hint: 'Commit to production' },
  { title: 'Deployment Frequency', value: '12 / week', hint: 'Across all services' },
  { title: 'Change Failure Rate', value: '6%', hint: 'Failed production changes' },
  { title: 'Mean Time to Restore', value: '42m', hint: 'Incident recovery' },
];

type StreamRow = {
  id: string;
  service: string;
  stage: string;
  status: string;
  duration: string;
};

const STREAM_ROWS: StreamRow[] = [
  {
    id: '1',
    service: 'checkout-api',
    stage: 'Production',
    status: 'Healthy',
    duration: '14m',
  },
  {
    id: '2',
    service: 'catalog-service',
    stage: 'Staging',
    status: 'In progress',
    duration: '8m',
  },
  {
    id: '3',
    service: 'identity-gateway',
    stage: 'Testing',
    status: 'Healthy',
    duration: '21m',
  },
  {
    id: '4',
    service: 'notifications',
    stage: 'Build',
    status: 'Attention',
    duration: '5m',
  },
];

const columns: TableColumn<StreamRow>[] = [
  { title: 'Service', field: 'service' },
  { title: 'Current stage', field: 'stage' },
  { title: 'Status', field: 'status' },
  { title: 'Cycle time', field: 'duration' },
];

export const VALUE_STREAM_DASHBOARD_PATH = '/value-stream-dashboard';

export const ValueStreamDashboard = () => {
  const classes = useStyles();

  return (
    <Page themeId="home">
      <Header
        title="Value Stream Dashboard"
        subtitle="Public delivery metrics — no sign-in required"
      />
      <Content>
        <Grid container spacing={3}>
          {METRICS.map(metric => (
            <Grid item xs={12} sm={6} md={3} key={metric.title}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    {metric.title}
                  </Typography>
                  <Typography className={classes.metricValue}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" className={classes.metricHint}>
                    {metric.hint}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <InfoCard title="Active value streams">
              <Table
                options={{ search: false, paging: false }}
                columns={columns}
                data={STREAM_ROWS}
              />
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
