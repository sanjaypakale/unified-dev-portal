import { createApiRef } from '@backstage/core-plugin-api';

export type PipelineDeploymentType = string;

export type Pipeline = {
  id?: number | string;
  appCode: string;
  bitbucketProjectName: string;
  moduleName: string;
  deploymentType: PipelineDeploymentType;
  targetId?: string;
  platformId?: string;
  typeId?: string;
  values?: Record<string, string>;
};

export type SavePipelineRequest = {
  pipelineId?: string;
  targetId?: string;
  platformId?: string;
  typeId?: string;
  values: Record<string, string>;
};

/** Pipeline data used by the continuous delivery pages. */
export interface DdpApi {
  getAllPipelines(): Promise<Pipeline[]>;
  savePipeline(request: SavePipelineRequest): Promise<{ id: number }>;
}

export const ddpApiRef = createApiRef<DdpApi>({
  id: 'plugin.pipeline.ddp',
});
