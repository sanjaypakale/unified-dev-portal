import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';

export type BitbucketRepoPermissionResponse = {
  branchPermissions?: {
    values?: unknown[];
  };
};

export interface DdpApi {
  getBitbucketRepoPermission(
    projectKey: string,
    repoName: string,
    permissionType: string,
  ): Promise<BitbucketRepoPermissionResponse>;
}

export const ddpApiRef = createApiRef<DdpApi>({
  id: 'plugin.app.ddp-api',
});

export class DdpApiClient implements DdpApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  async getBitbucketRepoPermission(
    projectKey: string,
    repoName: string,
    permissionType: string,
  ): Promise<BitbucketRepoPermissionResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('proxy');
    const url = `${baseUrl}/ddp/bitbucket/${encodeURIComponent(
      projectKey,
    )}/${encodeURIComponent(repoName)}/${encodeURIComponent(permissionType)}`;
    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch bitbucket permissions: ${response.status}`,
      );
    }

    return response.json();
  }
}
