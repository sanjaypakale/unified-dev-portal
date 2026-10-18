import { Pipeline, PipelineDeploymentType } from '../../api/DdpApi';

export const PIPELINES_PATH = '/pipelines';

export type PipelineForm = {
  id: string;
  appCode: string;
  bitbucketProjectName: string;
  moduleName: string;
  deploymentType: PipelineDeploymentType;
};

export const toPipelineForm = (pipeline: Pipeline): PipelineForm => ({
  id:
    pipeline.id !== undefined && pipeline.id !== null
      ? String(pipeline.id)
      : '',
  appCode: pipeline.appCode || '',
  bitbucketProjectName: pipeline.bitbucketProjectName || '',
  moduleName: pipeline.moduleName || '',
  deploymentType: pipeline.deploymentType || 'Kustomize',
});
