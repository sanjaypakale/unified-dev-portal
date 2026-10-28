import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import {
  CREATE_PIPELINE_PATH,
  readOnboardSearch,
  reonboardPath,
} from './paths';
import {
  CLOUD_PLATFORM_ID,
  CONTAINER_SERVICE_ID,
  DEPLOYMENT_TARGET_OPTIONS,
  findOption,
  OPENSHIFT_METHOD_OPTIONS,
  OTHERS_PLATFORM_ID,
  PLATFORM_OPTIONS,
} from './wizardOptions';

export const OnboardApplicationPage = () => {
  const classes = useCreatePipelineStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { pipelineId } = useParams();
  const cloudOptions = useCloudProviderOptions();
  const { targetId, platformId, typeId, step } = readOnboardSearch(location.search);
  const target = findOption(DEPLOYMENT_TARGET_OPTIONS, targetId);
  const platform = findOption(PLATFORM_OPTIONS, platformId);
  const typeOptions =
    platformId === CLOUD_PLATFORM_ID ? cloudOptions : OPENSHIFT_METHOD_OPTIONS;
  const deploymentType =
    platformId === OTHERS_PLATFORM_ID
      ? platform
      : findOption(typeOptions, typeId);
  const ready =
    target?.id === CONTAINER_SERVICE_ID &&
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
            {target?.title} / {platform?.title} /{' '}
            {deploymentType?.deploymentTypeLabel}
          </Typography>
        ) : (
          <Typography>Choose Container Service before continuing.</Typography>
        )}
        <Typography className={classes.helper}>
          The onboard form will be added on this page.
        </Typography>
        <div className={classes.actions}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate(pipelineId ? reonboardPath(pipelineId) : CREATE_PIPELINE_PATH, {
                state: { targetId, platformId, typeId, step },
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
