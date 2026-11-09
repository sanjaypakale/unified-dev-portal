import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import { readBitbucketServer } from '../bitbucket/bitbucketServer';
import { createBitbucketDeploymentSchemaSource } from './bitbucketDeploymentSchema';

const logger = { info: jest.fn() } as unknown as LoggerService;

const serverConfig = (values: Record<string, string | undefined>) =>
  ({
    getOptionalConfigArray: (key: string) => {
      if (key !== 'integrations.bitbucketServer') {
        return undefined;
      }
      return [
        {
          getString: () => values.host ?? '',
          getOptionalString: (name: string) => values[name],
        },
      ];
    },
  }) as unknown as RootConfigService;

describe('createBitbucketDeploymentSchemaSource', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('stays unset when Bitbucket Server is not configured', () => {
    const config = {
      getOptionalConfigArray: () => undefined,
    } as unknown as RootConfigService;

    expect(readBitbucketServer(config)).toBeUndefined();
  });

  it('reads both schema files from the developerportal repository', async () => {
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify(
          String(url).endsWith(
            'config/cd-deployment/schema/openshift-deployment.json',
          )
            ? { id: 'openshift-deployment', groups: [] }
            : [{ id: 'cloud-aws', fields: [] }],
        ),
    }));

    const server = readBitbucketServer(
      serverConfig({
        host: 'bitbucket.example.com',
        apiBaseUrl: 'https://bitbucket.example.com/rest/api/1.0/',
        token: 'secret-token',
      }),
    );
    const source = createBitbucketDeploymentSchemaSource(server!, logger);

    await expect(source.load()).resolves.toEqual({
      id: 'openshift-deployment',
      groups: [{ id: 'cloud-aws', fields: [] }],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://bitbucket.example.com/rest/api/1.0/projects/gbtdpsddp/repos/developerportal/raw/config/cd-deployment/schema/openshift-deployment.json',
      { headers: { Authorization: 'Bearer secret-token' } },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://bitbucket.example.com/rest/api/1.0/projects/gbtdpsddp/repos/developerportal/raw/config/cd-deployment/schema/cloud-provider.json',
      { headers: { Authorization: 'Bearer secret-token' } },
    );
  });
});
