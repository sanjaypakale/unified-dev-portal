import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {
  Content,
  Header,
  HeaderLabel,
  Page,
} from '@backstage/core-components';
import { PIPELINES_PATH } from '../types';
import { useCloudProviderOptions } from './cloudProviders';
import { useCreatePipelineStyles } from './createPipeline.styles';
import { readWizardPath, wizardPath } from './paths';
import { SelectableCard } from './SelectableCard';
import {
  CLOUD_PLATFORM_ID,
  CONTAINER_SERVICE_OPTIONS,
  findOption,
  OPENSHIFT_WORKLOAD_ID,
  PLATFORM_OPTIONS,
  WIZARD_STEP_TITLES,
  WizardOption,
  WORKLOAD_OPTIONS,
} from './wizardOptions';

const BLOCKED_MESSAGE = 'This deployment type is not available yet.';

/** Step content without the collapse animation. */
const StepPanel = ({ children }: { children?: ReactNode }) => (
  <div>{children}</div>
);

const optionsForStep = (
  index: number,
  platformId: string | undefined,
  cloudOptions: WizardOption[],
) => {
  if (index === 0) {
    return WORKLOAD_OPTIONS;
  }
  if (index === 1) {
    return PLATFORM_OPTIONS;
  }
  if (platformId === CLOUD_PLATFORM_ID) {
    return cloudOptions;
  }
  return CONTAINER_SERVICE_OPTIONS;
};

export const CreatePipelineWizard = () => {
  const classes = useCreatePipelineStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const cloudOptions = useCloudProviderOptions();
  const { workloadId, platformId, typeId } = readWizardPath(location.pathname);
  const activeIndex = [workloadId, platformId].filter(Boolean).length;
  const restoredId =
    (location.state as { selectedId?: string } | null)?.selectedId ?? '';
  const [selectedId, setSelectedId] = useState(restoredId);

  useEffect(() => {
    setSelectedId(restoredId);
  }, [location.pathname, restoredId]);

  const workload = findOption(WORKLOAD_OPTIONS, workloadId);
  const platform = findOption(PLATFORM_OPTIONS, platformId);
  const options = optionsForStep(activeIndex, platformId, cloudOptions);
  const selected = options.find(option => option.id === selectedId);
  const pathIsValid =
    activeIndex === 0 ||
    (workload?.id === OPENSHIFT_WORKLOAD_ID &&
      (activeIndex < 2 || Boolean(platform)));
  const blocked = Boolean(selected && selected.available === false);

  const goBack = () => {
    if (activeIndex === 0) {
      navigate(PIPELINES_PATH);
      return;
    }
    const ids = [workloadId, platformId].filter((id): id is string => Boolean(id));
    navigate(wizardPath(...ids.slice(0, -1)), {
      state: { selectedId: ids[ids.length - 1] },
    });
  };

  const goNext = () => {
    if (!selected || blocked) {
      return;
    }
    const nextIds = [workloadId, platformId, selected.id].filter(
      (id): id is string => Boolean(id),
    );
    if (activeIndex === WIZARD_STEP_TITLES.length - 1) {
      navigate(wizardPath(...nextIds, 'onboard'));
      return;
    }
    navigate(wizardPath(...nextIds));
  };

  if (typeId) {
    return (
      <Navigate
        to={wizardPath(workloadId, platformId, typeId, 'onboard')}
        replace
      />
    );
  }

  const sectionLabel =
    activeIndex === 0
      ? 'Type of workload'
      : activeIndex === 1
        ? 'OpenShift target'
        : platformId === CLOUD_PLATFORM_ID
          ? 'Cloud provider'
          : 'Container service';

  return (
    <Page themeId="tool">
      <Header
        title="Create a Pipeline"
        subtitle="Choose an OpenShift deployment type, then continue to onboarding"
      >
        <HeaderLabel label="Owner" value="Platform" />
      </Header>
      <Content>
        <Stepper
          className={classes.stepper}
          activeStep={activeIndex}
          orientation="vertical"
        >
          {WIZARD_STEP_TITLES.map((title, index) => (
            <Step key={title}>
              <StepLabel>{title}</StepLabel>
              {index === activeIndex && (
                <StepContent TransitionComponent={StepPanel}>
                  {!pathIsValid && (
                    <Typography>
                      Choose an OpenShift Container deployment before continuing.
                    </Typography>
                  )}
                  {pathIsValid && (
                    <>
                      <Typography variant="body2" className={classes.sectionLabel}>
                        {sectionLabel}
                      </Typography>
                      <div className={classes.cardRow} role="group" aria-label={sectionLabel}>
                        {options.map(option => (
                          <SelectableCard
                            key={option.id}
                            option={option}
                            selected={option.id === selectedId}
                            onSelect={setSelectedId}
                          />
                        ))}
                      </div>
                      {blocked && (
                        <Typography variant="body2" className={classes.helper}>
                          {BLOCKED_MESSAGE}
                        </Typography>
                      )}
                    </>
                  )}
                  <div className={classes.actions}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={goBack}
                    >
                      Back
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={goNext}
                      disabled={!pathIsValid || !selected || blocked}
                    >
                      Next
                    </Button>
                  </div>
                </StepContent>
              )}
            </Step>
          ))}
        </Stepper>
      </Content>
    </Page>
  );
};
