import { useNavigate } from 'react-router-dom';
import {
  Content,
  ContentHeader,
  Header,
  InfoCard,
  Page,
} from '@backstage/core-components';
import { Button, Grid, Typography } from '@material-ui/core';
import { DEV_TOOLS } from './devTools';

export const PipelineDashboard = () => {
  const navigate = useNavigate();
  const redirect = (path: string) => {
    navigate(path);
  };

  return (
    <Page themeId="tool">
      <Header
        title="Pipeline Self-Service"
        subtitle="Self-service platform for deployment pipelines"
      />
      <Content>
        <ContentHeader />
        <Grid container spacing={3}>
          {DEV_TOOLS.map(tool => (
            <Grid item xs={12} sm={6} key={tool.id}>
              <InfoCard title={tool.title} variant="gridItem">
                <Typography variant="body2" paragraph>
                  {tool.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => redirect(tool.path)}
                >
                  {tool.actionLabel}
                </Button>
              </InfoCard>
            </Grid>
          ))}
        </Grid>
      </Content>
    </Page>
  );
};
