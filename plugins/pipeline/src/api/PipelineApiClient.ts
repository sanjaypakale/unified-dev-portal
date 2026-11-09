import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { DdpApi, Pipeline, SavePipelineRequest } from './DdpApi';

type SavedPipeline = SavePipelineRequest & {
  id?: number | string;
};

const deploymentTypeFor = (record: SavedPipeline) => {
  const typeId = record.typeId || '';
  const labels: Record<string, string> = {
    kustomize: 'Kustomize',
    helm: 'Helm',
    'kubernetes-manifest': 'Kubernetes Manifest',
    others: 'Others',
  };
  if (labels[typeId]) {
    return labels[typeId];
  }
  if (record.platformId === 'cloud' && typeId) {
    return typeId.toUpperCase();
  }
  return typeId;
};

const toPipeline = (record: SavedPipeline): Pipeline => ({
  id: record.id,
  appCode: record.values?.APP_CODE || '',
  bitbucketProjectName: record.values?.BITBUCKET_PROJECT_NAME || '',
  moduleName: record.values?.MODULE_NAME || '',
  deploymentType: deploymentTypeFor(record),
  targetId: record.targetId,
  platformId: record.platformId,
  typeId: record.typeId,
  values: Object.fromEntries(
    Object.entries(record.values ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  ),
});

/** Reads and saves pipelines through the pipeline backend. */
export class PipelineApiClient implements DdpApi {
  constructor(
    private readonly options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
    },
  ) {}

  private async url(path: string) {
    const baseUrl = await this.options.discoveryApi.getBaseUrl('pipeline');
    return `${baseUrl}${path}`;
  }

  async getAllPipelines(): Promise<Pipeline[]> {
    const response = await this.options.fetchApi.fetch(await this.url('/pipelines'));
    if (!response.ok) {
      throw new Error(`Failed to fetch pipelines (${response.status})`);
    }
    const records = (await response.json()) as SavedPipeline[];
    return (Array.isArray(records) ? records : []).map(toPipeline);
  }

  async savePipeline(request: SavePipelineRequest): Promise<{ id: number }> {
    const response = await this.options.fetchApi.fetch(await this.url('/onboard'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Onboard request failed (${response.status})`);
    }
    return (await response.json()) as { id: number };
  }
}
