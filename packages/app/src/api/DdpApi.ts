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

export type EarApplicationPayload = Record<string, unknown>;

const DUMMY_EAR_APPS: EarApplicationPayload[] = [
  {
    id: '1',
    appCode: 'PAY',
    uniqueAppCode: 'PAY-001',
    appName: 'Payments Service',
    l2Code: 'L2-FIN',
    appLead: 'Jane Doe',
    appLeadLanId: 'jdoe',
    l2Head: 'John Smith',
    sonarInstance: 'sonar.example.com',
    jenkinsInstance: 'jenkins.example.com',
    artifactoryInstance: 'artifactory.example.com',
    veracodeInstance: 'veracode.example.com',
    bitbucketInstance: 'bitbucket.example.com',
    dastInstance: 'dast.example.com',
    isActive: true,
    domain: 'Finance',
    l3Name: 'Payments',
    l3Code: 'L3-PAY',
  },
  {
    id: '2',
    appCode: 'IDP',
    uniqueAppCode: 'IDP-002',
    appName: 'Identity Portal',
    l2Code: 'L2-SEC',
    appLead: 'Alice Tan',
    appLeadLanId: 'atan',
    l2Head: 'Bob Lee',
    sonarInstance: 'sonar.example.com',
    jenkinsInstance: 'jenkins.example.com',
    artifactoryInstance: '',
    veracodeInstance: 'veracode.example.com',
    bitbucketInstance: 'bitbucket.example.com',
    dastInstance: '',
    isActive: true,
    domain: 'Security',
    l3Name: 'Identity',
    l3Code: 'L3-IDP',
  },
  {
    id: '3',
    appCode: 'CAT',
    uniqueAppCode: 'CAT-003',
    appName: 'Catalog Gateway',
    l2Code: 'L2-PLT',
    appLead: 'Chris Wong',
    appLeadLanId: 'cwong',
    l2Head: 'Dana Lim',
    sonarInstance: '',
    jenkinsInstance: 'jenkins.example.com',
    artifactoryInstance: 'artifactory.example.com',
    veracodeInstance: '',
    bitbucketInstance: 'bitbucket.example.com',
    dastInstance: 'dast.example.com',
    isActive: false,
    domain: 'Platform',
    l3Name: 'Catalog',
    l3Code: 'L3-CAT',
  },
];

export interface DdpApi {
  getBitbucketRepoPermission(
    projectKey: string,
    repoName: string,
    permissionType: string,
  ): Promise<BitbucketRepoPermissionResponse>;
  getAllEarApps(): Promise<any[]>;
  createOrUpdateEarApplication(
    payload: EarApplicationPayload,
  ): Promise<unknown>;
}

export const ddpApiRef = createApiRef<DdpApi>({
  id: 'plugin.app.ddp-api',
});

export class DdpApiClient implements DdpApi {
  private earApps: EarApplicationPayload[] = [...DUMMY_EAR_APPS];

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

  async getAllEarApps(): Promise<any[]> {
    // Dummy data for local UI. Replace with proxy API call when backend is ready.
    return this.earApps.map(app => ({ ...app }));
  }

  async createOrUpdateEarApplication(
    payload: EarApplicationPayload,
  ): Promise<unknown> {
    // Dummy in-memory create/update. Replace with proxy API call when backend is ready.
    const appCode = String(payload.appCode ?? '');
    const existingIndex = this.earApps.findIndex(
      app => String(app.appCode) === appCode,
    );

    if (existingIndex >= 0) {
      this.earApps[existingIndex] = {
        ...this.earApps[existingIndex],
        ...payload,
        id: this.earApps[existingIndex].id,
      };
      return this.earApps[existingIndex];
    }

    const created = {
      ...payload,
      id: String(this.earApps.length + 1),
    };
    this.earApps.push(created);
    return created;
  }
}
