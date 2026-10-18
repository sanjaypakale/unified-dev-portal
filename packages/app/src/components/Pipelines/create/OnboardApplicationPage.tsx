import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
  Content,
  Header,
  HeaderLabel,
  Page,
} from '@backstage/core-components';
import { useCloudProviderOptions } from './cloudProviders';
import { useCreatePipelineStyles } from './createPipeline.styles';
import { readWizardPath, wizardPath } from './paths';
import {
  CLOUD_PLATFORM_ID,
  CONTAINER_SERVICE_OPTIONS,
  findOption,
  OPENSHIFT_WORKLOAD_ID,
  PLATFORM_OPTIONS,
  WORKLOAD_OPTIONS,
} from './wizardOptions';

export const OnboardApplicationPage = () => {
  const classes = useCreatePipelineStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const cloudOptions = useCloudProviderOptions();
  const { workloadId, platformId, typeId } = readWizardPath(location.pathname);
  const workload = findOption(WORKLOAD_OPTIONS, workloadId);
  const platform = findOption(PLATFORM_OPTIONS, platformId);
  const typeOptions =
    platformId === CLOUD_PLATFORM_ID ? cloudOptions : CONTAINER_SERVICE_OPTIONS;
  const deploymentType = findOption(typeOptions, typeId);
  const ready =
    workload?.id === OPENSHIFT_WORKLOAD_ID &&
    Boolean(platform) &&
    Boolean(deploymentType?.deploymentTypeLabel);

  return (
    <Page themeId="tool">
      <Header
        title="Onboard the application"
        subtitle="Application details for the selected deployment"
      >
        <HeaderLabel label="Owner" value="Platform" />
      </Header>
      <Content>
        {ready ? (
          <Typography className={classes.summary}>
            {workload?.title} / {platform?.title} /{' '}
            {deploymentType?.deploymentTypeLabel}
          </Typography>
        ) : (
          <Typography>
            Choose an OpenShift Container deployment before continuing.
          </Typography>
        )}
        <Typography className={classes.helper}>
          The onboard form will be added on this page.
        </Typography>
        <div className={classes.actions}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate(wizardPath(workloadId, platformId), {
                state: { selectedId: typeId },
              })
            }
          >
            Back
          </Button>
        </div>
      </Content>
    </Page>
  );
};
