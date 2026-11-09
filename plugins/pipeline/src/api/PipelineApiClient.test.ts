import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { PipelineApiClient } from './PipelineApiClient';

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

describe('PipelineApiClient', () => {
  const discoveryApi = {
    getBaseUrl: async () => 'http://pipeline.test',
  } as DiscoveryApi;

  it('loads saved pipelines and posts a new one', async () => {
    const fetch = jest.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return jsonResponse({ id: 4, status: 'accepted' }, 201);
      }
      return jsonResponse([
        {
          id: 4,
          targetId: 'container-service',
          platformId: 'openshift',
          typeId: 'kustomize',
          values: {
            APP_CODE: 'PAY',
            BITBUCKET_PROJECT_NAME: 'PAY',
            MODULE_NAME: 'payments-service',
          },
        },
      ]);
    });
    const client = new PipelineApiClient({
      discoveryApi,
      fetchApi: { fetch } as unknown as FetchApi,
    });

    await expect(client.getAllPipelines()).resolves.toEqual([
      {
        id: 4,
        appCode: 'PAY',
        bitbucketProjectName: 'PAY',
        moduleName: 'payments-service',
        deploymentType: 'Kustomize',
        targetId: 'container-service',
        platformId: 'openshift',
        typeId: 'kustomize',
        values: {
          APP_CODE: 'PAY',
          BITBUCKET_PROJECT_NAME: 'PAY',
          MODULE_NAME: 'payments-service',
        },
      },
    ]);

    await expect(
      client.savePipeline({
        targetId: 'container-service',
        platformId: 'openshift',
        typeId: 'kustomize',
        values: { MODULE_NAME: 'payments-service' },
      }),
    ).resolves.toEqual({ id: 4, status: 'accepted' });

    expect(fetch).toHaveBeenCalledWith('http://pipeline.test/pipelines');
    expect(fetch).toHaveBeenCalledWith(
      'http://pipeline.test/onboard',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
