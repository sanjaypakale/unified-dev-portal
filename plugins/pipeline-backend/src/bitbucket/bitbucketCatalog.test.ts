import { RootConfigService } from '@backstage/backend-plugin-api';
import { createBitbucketCatalog } from './bitbucketCatalog';
import { readBitbucketServer } from './bitbucketServer';

const config = {
  getOptionalConfigArray: () => [
    {
      getString: () => 'bitbucket.example.com',
      getOptionalString: (name: string) =>
        name === 'token' ? 'secret-token' : undefined,
    },
  ],
} as unknown as RootConfigService;

describe('createBitbucketCatalog', () => {
  it('lists projects and repositories from Bitbucket Server', async () => {
    const fetchMock = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(url).includes('/repos?')
          ? {
              isLastPage: true,
              values: [{ name: 'payments-service', slug: 'payments-service' }],
            }
          : {
              isLastPage: false,
              nextPageStart: 1,
              values: [{ key: 'PAY', name: 'PAY' }],
            },
    }));
    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        isLastPage: false,
        nextPageStart: 1,
        values: [{ key: 'PAY', name: 'PAY' }],
      }),
    }));
    fetchMock.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        isLastPage: true,
        values: [{ key: 'IDP', name: 'IDP' }],
      }),
    }));
    global.fetch = fetchMock as typeof fetch;

    const catalog = createBitbucketCatalog(readBitbucketServer(config)!);
    await expect(catalog.listProjects()).resolves.toEqual([
      { key: 'PAY', name: 'PAY' },
      { key: 'IDP', name: 'IDP' },
    ]);

    fetchMock.mockImplementation(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        isLastPage: true,
        values: [{ name: 'payments-service', slug: 'payments-service' }],
      }),
    }));
    await expect(catalog.listRepositories('PAY')).resolves.toEqual([
      { name: 'payments-service' },
    ]);
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain(
      '/projects/PAY/repos?limit=100',
    );
  });
});
