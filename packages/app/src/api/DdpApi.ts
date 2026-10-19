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
};

export type BitbucketBranchingMetadata = {
  id?: number | string;
  branchingEnabled?: boolean;
  domainName?: string;
  uniqueAppCode?: string;
  bitbucketProjectKey?: string;
  repositoryName?: string;
  as400?: boolean;
  branchNamingRegex?: string;
  enforcementDate?: string;
  minimumGate?: number | string;
  currentBranchingScore?: number | string;
  currentBranchingGate?: number | string;
  branchingStrategySopLink?: string;
};

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

const DUMMY_PIPELINES: Pipeline[] = [
  {
    id: '1',
    appCode: 'PAY',
    bitbucketProjectName: 'PAY',
    moduleName: 'payments-service',
    deploymentType: 'Kustomize',
  },
  {
    id: '2',
    appCode: 'IDP',
    bitbucketProjectName: 'IDP',
    moduleName: 'identity-portal',
    deploymentType: 'Cloud (AWS)',
  },
  {
    id: '3',
    appCode: 'CAT',
    bitbucketProjectName: 'CAT',
    moduleName: 'catalog-gateway',
    deploymentType: 'Custom',
  },
];

const DUMMY_BITBUCKET_BRANCHING: BitbucketBranchingMetadata[] = [
  {
    id: 1,
    branchingEnabled: true,
    domainName: 'Payments',
    uniqueAppCode: 'PAY-001',
    bitbucketProjectKey: 'PAY',
    repositoryName: 'payments-service',
    as400: false,
    branchNamingRegex: '^(feature|bugfix|hotfix)/.+$',
    enforcementDate: '2026-01-15',
    minimumGate: 80,
    currentBranchingScore: 92,
    currentBranchingGate: 80,
    branchingStrategySopLink: 'https://wiki.example.com/branching/pay',
  },
  {
    id: 2,
    branchingEnabled: true,
    domainName: 'Identity',
    uniqueAppCode: 'IDP-002',
    bitbucketProjectKey: 'IDP',
    repositoryName: 'identity-portal',
    as400: false,
    branchNamingRegex: '^(feature|release)/.+$',
    enforcementDate: '2026-02-01',
    minimumGate: 70,
    currentBranchingScore: 75,
    currentBranchingGate: 70,
    branchingStrategySopLink: 'https://wiki.example.com/branching/idp',
  },
  {
    id: 3,
    branchingEnabled: false,
    domainName: 'Platform',
    uniqueAppCode: 'CAT-003',
    bitbucketProjectKey: 'CAT',
    repositoryName: 'catalog-gateway',
    as400: true,
    branchNamingRegex: '^release/.+$',
    enforcementDate: '2026-03-01',
    minimumGate: 60,
    currentBranchingScore: 58,
    currentBranchingGate: 60,
    branchingStrategySopLink: '',
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
  getAllBitbucketBranchingMetadata(): Promise<BitbucketBranchingMetadata[]>;
  createOrUpdateBitbucketBranchingMetadata(
    payload: BitbucketBranchingMetadata,
  ): Promise<unknown>;
  getAllPipelines(): Promise<Pipeline[]>;
  createOrUpdatePipeline(payload: Pipeline): Promise<Pipeline>;
}

export const ddpApiRef = createApiRef<DdpApi>({
  id: 'plugin.app.ddp-api',
});

export class DdpApiClient implements DdpApi {
  private earApps: EarApplicationPayload[] = [...DUMMY_EAR_APPS];
  private branchingMetadata: BitbucketBranchingMetadata[] = [
    ...DUMMY_BITBUCKET_BRANCHING,
  ];
  private pipelines: Pipeline[] = [...DUMMY_PIPELINES];

  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) { }

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

  async getAllBitbucketBranchingMetadata(): Promise<
    BitbucketBranchingMetadata[]
  > {
    // Dummy data for local UI. Replace with proxy API call when backend is ready.
    return this.branchingMetadata.map(record => ({ ...record }));
  }

  async createOrUpdateBitbucketBranchingMetadata(
    payload: BitbucketBranchingMetadata,
  ): Promise<unknown> {
    // Dummy in-memory create/update. Replace with proxy API call when backend is ready.
    const payloadId =
      payload.id !== undefined && payload.id !== null && payload.id !== ''
        ? String(payload.id)
        : '';
    const existingIndex = this.branchingMetadata.findIndex(record => {
      if (payloadId) {
        return String(record.id) === payloadId;
      }
      return (
        String(record.uniqueAppCode) === String(payload.uniqueAppCode) &&
        String(record.bitbucketProjectKey) ===
        String(payload.bitbucketProjectKey) &&
        String(record.repositoryName) === String(payload.repositoryName)
      );
    });

    if (existingIndex >= 0) {
      this.branchingMetadata[existingIndex] = {
        ...this.branchingMetadata[existingIndex],
        ...payload,
        id: this.branchingMetadata[existingIndex].id,
      };
      return this.branchingMetadata[existingIndex];
    }

    const created: BitbucketBranchingMetadata = {
      ...payload,
      id: this.branchingMetadata.length + 1,
    };
    this.branchingMetadata.push(created);
    return created;
  }

  async getAllPipelines(): Promise<Pipeline[]> {
    // Dummy data for local UI. Replace with proxy API call when backend is ready.
    return this.pipelines.map(pipeline => ({ ...pipeline }));
  }

  async createOrUpdatePipeline(payload: Pipeline): Promise<Pipeline> {
    // Dummy in-memory create/update. Replace with proxy API call when backend is ready.
    const payloadId =
      payload.id !== undefined && payload.id !== null && payload.id !== ''
        ? String(payload.id)
        : '';
    const existingIndex = this.pipelines.findIndex(pipeline => {
      if (payloadId) {
        return String(pipeline.id) === payloadId;
      }
      return (
        pipeline.appCode === payload.appCode &&
        pipeline.bitbucketProjectName === payload.bitbucketProjectName &&
        pipeline.moduleName === payload.moduleName
      );
    });

    if (existingIndex >= 0) {
      this.pipelines[existingIndex] = {
        ...this.pipelines[existingIndex],
        ...payload,
        id: this.pipelines[existingIndex].id,
      };
      return { ...this.pipelines[existingIndex] };
    }

    const created: Pipeline = {
      ...payload,
      id: String(this.pipelines.length + 1),
    };
    this.pipelines.push(created);
    return { ...created };
  }
}
