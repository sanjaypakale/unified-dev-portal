import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
  Content,
  Header,
  HeaderLabel,
  Page,
  Progress,
} from '@backstage/core-components';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { ddpApiRef } from '../../../api/DdpApi';
import { PIPELINES_PATH } from '../types';
import { useCloudProviderOptions } from './cloudProviders';
import { useCreatePipelineStyles } from './createPipeline.styles';
import { applyFieldChange } from './fieldValues';
import { stepErrors } from './fieldValidation';
import { buildOnboardSteps, groupsForStep } from './onboardSteps';
import {
  CREATE_PIPELINE_PATH,
  readOnboardSearch,
  reonboardPath,
} from './paths';
import { ReviewFields } from './ReviewFields';
import { SchemaContext } from './schema';
import { SchemaForm } from './SchemaForm';
import { useDeploymentSchema } from './useDeploymentSchema';
import {
  CLOUD_PLATFORM_ID,
  CONTAINER_SERVICE_ID,
  DEPLOYMENT_TARGET_OPTIONS,
  findOption,
  OPENSHIFT_METHOD_OPTIONS,
  OTHERS_PLATFORM_ID,
  OPENSHIFT_PLATFORM_ID,
  PLATFORM_OPTIONS,
} from './wizardOptions';

export const OnboardApplicationPage = () => {
  const classes = useCreatePipelineStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { pipelineId } = useParams();
  const ddpApi = useApi(ddpApiRef);
  const alertApi = useApi(alertApiRef);
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
  const method = platformId === OPENSHIFT_PLATFORM_ID ? typeId : undefined;
  const cloudProvider = platformId === CLOUD_PLATFORM_ID ? typeId : undefined;
  const cloudLabel =
    platformId === CLOUD_PLATFORM_ID ? deploymentType?.title : undefined;
  const { schema, error, loading } = useDeploymentSchema({
    enabled: ready,
    method,
    cloudProvider,
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<
    Record<string, string> | undefined
  >(pipelineId ? undefined : {});
  const [activeStep, setActiveStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [submittedId, setSubmittedId] = useState<number>();
  const context: SchemaContext = { platform: platformId, cloudProvider };
  const steps = buildOnboardSteps({
    deploymentLabel:
      platformId === CLOUD_PLATFORM_ID
        ? 'Deployment'
        : deploymentType?.deploymentTypeLabel,
    cloudLabel,
  });
  const currentStep = steps[Math.min(activeStep, steps.length - 1)];

  useEffect(() => {
    if (!pipelineId) {
      return undefined;
    }
    let active = true;
    ddpApi
      .getAllPipelines()
      .then(pipelines => {
        if (!active) {
          return;
        }
        const saved = pipelines.find(item => String(item.id) === pipelineId);
        setSavedValues(saved?.values ?? {});
      })
      .catch(() => {
        if (active) {
          setSavedValues({});
        }
      });
    return () => {
      active = false;
    };
  }, [ddpApi, pipelineId]);

  useEffect(() => {
    if (!schema || savedValues === undefined) {
      return;
    }
    setValues(current => {
      if (Object.keys(current).length > 0) {
        return current;
      }
      const next = { ...savedValues };
      schema.groups.forEach(group => {
        group.fields.forEach(field => {
          if (next[field.key] === undefined && field.defaultValue) {
            next[field.key] = field.defaultValue;
          }
        });
      });
      return next;
    });
  }, [schema, savedValues]);

  const leaveWizard = () =>
    navigate(pipelineId ? reonboardPath(pipelineId) : CREATE_PIPELINE_PATH, {
      state: { targetId, platformId, typeId, step },
    });

  const goNext = () => {
    if (!schema || currentStep.id === 'review') {
      return;
    }
    const errors = stepErrors(
      groupsForStep(schema.groups, currentStep.id),
      values,
      context,
    );
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setActiveStep(index => Math.min(index + 1, steps.length - 1));
  };

  const goBack = () => {
    setShowErrors(false);
    setSubmitError(undefined);
    if (activeStep === 0) {
      leaveWizard();
      return;
    }
    setActiveStep(index => index - 1);
  };

  const onboard = async () => {
    if (!schema) {
      return;
    }
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const saved = await ddpApi.savePipeline({
        pipelineId,
        targetId,
        platformId,
        typeId,
        values,
      });
      setSubmittedId(saved.id);
      const moduleName = values.MODULE_NAME || 'the application';
      const project = values.BITBUCKET_PROJECT_NAME;
      const deployment = deploymentType?.deploymentTypeLabel || 'the selected deployment';
      alertApi.post({
        message: `${pipelineId ? 'Reonboarded' : 'Onboarded'} ${moduleName}${
          project ? ` in ${project}` : ''
        } for ${deployment}.`,
        severity: 'success',
      });
      navigate(PIPELINES_PATH);
    } catch (submitFailure) {
      setSubmitError(
        submitFailure instanceof Error
          ? submitFailure.message
          : 'Unable to onboard the application.',
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        {ready && (loading || savedValues === undefined) && <Progress />}
        {ready && error && (
          <Typography color="error" className={classes.helper}>
            {error}
          </Typography>
        )}
        {ready && schema && savedValues !== undefined && (
          <>
            <Stepper
              className={classes.stepper}
              activeStep={activeStep}
              alternativeLabel
            >
              {steps.map(item => (
                <Step key={item.id}>
                  <StepLabel>{item.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {currentStep.id === 'review' ? (
              <ReviewFields
                groups={schema.groups}
                values={values}
                context={context}
              />
            ) : (
              <SchemaForm
                groups={groupsForStep(schema.groups, currentStep.id)}
                values={values}
                context={context}
                forceError={showErrors}
                onChange={(key, value) =>
                  setValues(current =>
                    applyFieldChange(current, schema.groups, key, value),
                  )
                }
              />
            )}
            {submitError && (
              <Typography color="error" className={classes.helper}>
                {submitError}
              </Typography>
            )}
            <div className={classes.actions}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={goBack}
              >
                Back
              </Button>
              {currentStep.id === 'review' ? (
                <>
                  <Button variant="outlined" onClick={() => navigate(PIPELINES_PATH)}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={submitting || submittedId !== undefined}
                    onClick={onboard}
                  >
                    Onboard
                  </Button>
                </>
              ) : (
                <Button variant="contained" color="primary" onClick={goNext}>
                  Next
                </Button>
              )}
            </div>
          </>
        )}
        {ready && !schema && !loading && !error && (
          <div className={classes.actions}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={leaveWizard}>
              Back
            </Button>
          </div>
        )}
      </Content>
    </Page>
  );
};
