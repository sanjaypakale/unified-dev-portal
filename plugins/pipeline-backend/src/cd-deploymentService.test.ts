import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import {
  createCdDeploymentService,
  renderDeploymentProperties,
} from './cd-deploymentService';

const logger = { info: jest.fn() } as unknown as LoggerService;

const emptyConfig = {
  getOptionalConfigArray: () => undefined,
} as unknown as RootConfigService;

const request = {
  appCode: 'PAY',
  platformId: 'openshift',
  typeId: 'kustomize',
  values: {
    APP_CODE: 'PAY',
    MODULE_NAME: 'payments-service',
    COUNTRY_CODE: 'SG',
    IS_VENDOR: 'yes',
    MULTI_IMAGE: 'no',
    CLUSTER_NETWORK: 'ECOM',
    SIT_OC_URL: 'https://sit.example',
  },
};

describe('renderDeploymentProperties', () => {
  const template = [
    'APP_CODE={{ APP_CODE }}',
    'CLUSTER_NAME={% if wizard.platformId == "openshift" %}redhat{% elif wizard.platformId == "cloud" %}cloud{% elif wizard.platformId == "others" %}others{% endif %}',
    'DEPLOY_TYPE={% if wizard.typeId == "helm" %}helm{% elif wizard.typeId == "kustomize" %}kustomize{% endif %}',
    'MODULE_PROPS_FILE_PATH={% if wizard.typeId == "helm" %}Chart.yaml{% else %}Version.properties{% endif %}',
    '{% if MULTI_IMAGE == "yes" %}',
    'IMAGES_FILE_PATH=images.yaml',
    '{% endif %}',
    'IS_VENDOR={% if IS_VENDOR == "yes" %}true{% else %}false{% endif %}',
  ].join('\n');

  it('fills kustomize values and omits the images path', () => {
    const content = renderDeploymentProperties(template, request);
    expect(content).toContain('APP_CODE=PAY');
    expect(content).toContain('CLUSTER_NAME=redhat');
    expect(content).toContain('DEPLOY_TYPE=kustomize');
    expect(content).toContain('MODULE_PROPS_FILE_PATH=Version.properties');
    expect(content).toContain('IS_VENDOR=true');
    expect(content).not.toContain('IMAGES_FILE_PATH');
  });

  it('uses helm paths and adds the images file when multi image is yes', () => {
    const content = renderDeploymentProperties(template, {
      ...request,
      typeId: 'helm',
      values: { ...request.values, MULTI_IMAGE: 'yes', IS_VENDOR: 'no' },
    });
    expect(content).toContain('DEPLOY_TYPE=helm');
    expect(content).toContain('MODULE_PROPS_FILE_PATH=Chart.yaml');
    expect(content).toContain('IMAGES_FILE_PATH=images.yaml');
    expect(content).toContain('IS_VENDOR=false');
  });

  it('leaves deploy type blank for a kubernetes manifest', () => {
    const content = renderDeploymentProperties(template, {
      ...request,
      typeId: 'kubernetes-manifest',
    });
    expect(content).toContain('DEPLOY_TYPE=');
    expect(content).toContain('MODULE_PROPS_FILE_PATH=Version.properties');
  });
});

describe('createCdDeploymentService', () => {
  it('fails when Bitbucket Server is not configured', async () => {
    const service = createCdDeploymentService({ config: emptyConfig, logger });
    await expect(service.createPropertiesFile(request)).rejects.toThrow(
      'integrations.bitbucketServer is not configured',
    );
  });

  it('writes the rendered file to the deployment-workflow repository', async () => {
    const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
      const target = String(url);
      if (target.includes('/raw/')) {
        return { ok: true, status: 200, text: async () => 'APP_CODE={{ APP_CODE }}\n' };
      }
      if (target.endsWith('/default-branch')) {
        return { ok: true, status: 200, json: async () => ({ displayId: 'master' }) };
      }
      if (target.includes('/commits?')) {
        return { ok: true, status: 200, json: async () => ({ values: [{ id: 'abc123' }] }) };
      }
      return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
    });
    global.fetch = fetchMock as typeof fetch;

    const config = {
      getOptionalConfigArray: () => [
        {
          getString: () => 'bitbucket.example.com',
          getOptionalString: (name: string) =>
            name === 'apiBaseUrl'
              ? 'https://bitbucket.example.com/rest/api/1.0'
              : name === 'token'
                ? 'secret-token'
                : undefined,
        },
      ],
    } as unknown as RootConfigService;

    const service = createCdDeploymentService({ config, logger });
    const result = await service.createPropertiesFile(request);

    expect(result.written).toBe(true);
    expect(result.content).toBe('APP_CODE=PAY\n');
    const putCall = fetchMock.mock.calls.find(
      call => (call[1] as RequestInit | undefined)?.method === 'PUT',
    );
    expect(String(putCall?.[0])).toBe(
      'https://bitbucket.example.com/rest/api/1.0/projects/DVO/repos/deployment-workflow/browse/PAY/cd_depoloyment_payments-service.properties',
    );
    expect(String((putCall?.[1] as RequestInit).body)).toContain('APP_CODE%3DPAY');
    expect(String((putCall?.[1] as RequestInit).body)).toContain('sourceCommitId=abc123');
    expect(String((putCall?.[1] as RequestInit).body)).toContain('branch=master');
  });
});
