import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Typography } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import EditIcon from '@material-ui/icons/Edit';
import { useApi } from '@backstage/core-plugin-api';
import {
  Content,
  Header,
  HeaderLabel,
  Page,
  Progress,
} from '@backstage/core-components';
import { ddpApiRef } from '../../../api/DdpApi';
import { useCloudProviderOptions } from './cloudProviders';
import { useCreatePipelineStyles } from './createPipeline.styles';
import {
  CREATE_ONBOARD_PATH,
  reonboardOnboardPath,
  toOnboardSearch,
  WizardDraft,
} from './paths';
import { SelectableCard } from './SelectableCard';
import {
  CLOUD_PLATFORM_ID,
  CONTAINER_SERVICE_ID,
  DEPLOYMENT_TARGET_OPTIONS,
  draftFromDeploymentType,
  OPENSHIFT_METHOD_OPTIONS,
  OPENSHIFT_PLATFORM_ID,
  OTHERS_PLATFORM_ID,
  PLATFORM_OPTIONS,
  WizardOption,
} from './wizardOptions';

const BLOCKED_MESSAGE = 'This deployment type is not available yet.';
const DEPLOY_STEP = 'What do you want to deploy?';
const ONBOARD_STEP = 'Onboard the application';

const draftFromState = (state: unknown): WizardDraft | undefined => {
  const draft = state as WizardDraft | null;
  return draft && typeof draft.step === 'number' ? draft : undefined;
};

type CardGroupProps = {
  label: string;
  options: WizardOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

const CardGroup = ({ label, options, selectedId, onSelect }: CardGroupProps) => {
  const classes = useCreatePipelineStyles();
  return (
    <div className={classes.section}>
      <Typography className={classes.sectionLabel}>{label}</Typography>
      <div className={classes.cardRow} role="group" aria-label={label}>
        {options.map(option => (
          <SelectableCard
            key={option.id}
            option={option}
            selected={option.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export const CreatePipelineWizard = () => {
  const classes = useCreatePipelineStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { pipelineId } = useParams();
  const ddpApi = useApi(ddpApiRef);
  const cloudOptions = useCloudProviderOptions();
  const cloudOptionsRef = useRef(cloudOptions);
  cloudOptionsRef.current = cloudOptions;
  const returnedDraft = draftFromState(location.state);
  const [draft, setDraft] = useState<WizardDraft>(
    () => returnedDraft ?? { step: 0 },
  );
  const [ready, setReady] = useState(!pipelineId || Boolean(returnedDraft));

  useEffect(() => {
    if (!pipelineId || returnedDraft) {
      return undefined;
    }
    let active = true;
    ddpApi
      .getAllPipelines()
      .then(pipelines => {
        if (!active) {
          return;
        }
        const pipeline = pipelines.find(item => String(item.id) === pipelineId);
        if (!pipeline) {
          return;
        }
        const saved = pipeline.targetId
          ? {
              targetId: pipeline.targetId,
              platformId: pipeline.platformId,
              typeId: pipeline.typeId,
            }
          : draftFromDeploymentType(
              pipeline.deploymentType,
              cloudOptionsRef.current,
            );
        setDraft({ ...saved, step: 0 });
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [ddpApi, pipelineId, returnedDraft]);

  const { targetId, platformId, typeId } = draft;
  const containerSelected = targetId === CONTAINER_SERVICE_ID;
  const openshiftSelected = containerSelected && platformId === OPENSHIFT_PLATFORM_ID;
  const cloudSelected = containerSelected && platformId === CLOUD_PLATFORM_ID;
  const othersSelected = containerSelected && platformId === OTHERS_PLATFORM_ID;
  const blocked = targetId === 'vmOrBareMetal';
  const canContinue =
    !blocked &&
    (othersSelected ||
      (openshiftSelected && Boolean(typeId)) ||
      (cloudSelected && Boolean(typeId)));

  const chooseTarget = (id: string) => {
    setDraft(current => ({
      ...current,
      targetId: id,
      platformId: id === current.targetId ? current.platformId : undefined,
      typeId: id === current.targetId ? current.typeId : undefined,
    }));
  };

  const choosePlatform = (id: string) => {
    setDraft(current => ({
      ...current,
      platformId: id,
      typeId: id === current.platformId ? current.typeId : undefined,
    }));
  };

  const chooseType = (id: string) => {
    setDraft(current => ({ ...current, typeId: id }));
  };

  const goNext = () => {
    if (!canContinue) {
      return;
    }
    const nextDraft: WizardDraft = {
      targetId,
      platformId,
      typeId: othersSelected ? OTHERS_PLATFORM_ID : typeId,
      step: 0,
    };
    const path = pipelineId
      ? reonboardOnboardPath(pipelineId)
      : CREATE_ONBOARD_PATH;
    navigate(`${path}${toOnboardSearch(nextDraft)}`);
  };

  return (
    <Page themeId="tool">
      <Header
        title={pipelineId ? 'Reonboard' : 'Create a Pipeline'}
        subtitle={
          pipelineId
            ? 'Change the deployment choices, then continue to onboarding'
            : 'Choose a deployment target, then continue to onboarding'
        }
      >
        <HeaderLabel label="Owner" value="Platform" />
      </Header>
      <Content>
        {!ready && <Progress />}
        {ready && (
          <div className={classes.flow}>
            <div className={classes.stepHeader}>
              <span className={classes.stepIconActive}>
                <EditIcon className={classes.stepIconGlyph} />
              </span>
              <Typography className={classes.stepTitle}>{DEPLOY_STEP}</Typography>
            </div>
            <div className={classes.stepBody}>
              <div className={classes.panel}>
                <CardGroup
                  label="Deployment target"
                  options={DEPLOYMENT_TARGET_OPTIONS}
                  selectedId={targetId}
                  onSelect={chooseTarget}
                />
                {containerSelected && (
                  <CardGroup
                    label="Container platform"
                    options={PLATFORM_OPTIONS}
                    selectedId={platformId}
                    onSelect={choosePlatform}
                  />
                )}
                {openshiftSelected && (
                  <CardGroup
                    label="Openshift deployment method"
                    options={OPENSHIFT_METHOD_OPTIONS}
                    selectedId={typeId}
                    onSelect={chooseType}
                  />
                )}
                {cloudSelected && (
                  <CardGroup
                    label="Cloud provider"
                    options={cloudOptions}
                    selectedId={typeId}
                    onSelect={chooseType}
                  />
                )}
                {blocked && (
                  <Typography variant="body2" className={classes.helper}>
                    {BLOCKED_MESSAGE}
                  </Typography>
                )}
                <div className={classes.actions}>
                  <Button
                    color="primary"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={goNext}
                    disabled={!canContinue}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
            <div className={classes.stepHeader}>
              <span className={classes.stepIconUpcoming} />
              <Typography className={classes.stepTitleUpcoming}>
                {ONBOARD_STEP}
              </Typography>
            </div>
          </div>
        )}
      </Content>
    </Page>
  );
};
