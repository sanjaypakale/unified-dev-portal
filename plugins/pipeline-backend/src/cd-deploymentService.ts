import nunjucks from 'nunjucks';
import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import {
  BitbucketServer,
  readBitbucketText,
  requireBitbucketServer,
} from './bitbucket/bitbucketServer';
import {
  BITBUCKET_SCHEMA_PROJECT,
  BITBUCKET_SCHEMA_REPOSITORY,
  DEPLOYMENT_OUTPUT_PROJECT,
  DEPLOYMENT_OUTPUT_REPOSITORY,
  DEPLOYMENT_TEMPLATE_PATH,
  deploymentPropertiesPath,
} from './schema/schemaLocation';

export type CdDeploymentRequest = {
  appCode?: string;
  targetId?: string;
  platformId?: string;
  typeId?: string;
  values: Record<string, string>;
};

export type CdDeploymentResult = {
  project: string;
  repository: string;
  path: string;
  content: string;
  written: boolean;
};

export type CdDeploymentService = {
  createPropertiesFile(request: CdDeploymentRequest): Promise<CdDeploymentResult>;
};

type BitbucketServer = {
  apiBaseUrl: string;
  headers: Record<string, string>;
};

const environment = nunjucks.configure({ autoescape: false });

const fileSegment = (value: string | undefined, label: string) => {
  const segment = value?.trim() ?? '';
  if (!segment || /[\\/]/.test(segment) || segment.includes('..')) {
    throw new Error(`${label} is required to create the properties file`);
  }
  return segment;
};

/** Fills the Nunjucks template from the onboard form. Property names stay in the template. */
export const renderDeploymentProperties = (
  template: string,
  request: CdDeploymentRequest,
) => {
  const rendered = environment.renderString(template, {
    ...request.values,
    APP_CODE: request.values.APP_CODE || request.appCode || '',
    wizard: {
      platformId: request.platformId ?? '',
      typeId: request.typeId ?? '',
      targetId: request.targetId ?? '',
    },
  });
  return `${rendered
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0)
    .join('\n')}\n`;
};

const readRemoteTemplate = (server: BitbucketServer) =>
  readBitbucketText(
    server,
    BITBUCKET_SCHEMA_PROJECT,
    BITBUCKET_SCHEMA_REPOSITORY,
    DEPLOYMENT_TEMPLATE_PATH,
  );

const branchName = async (
  server: BitbucketServer,
  project: string,
  repository: string,
) => {
  const base = `${server.apiBaseUrl}/projects/${encodeURIComponent(project)}/repos/${encodeURIComponent(repository)}`;
  let response = await fetch(`${base}/default-branch`, { headers: server.headers });
  if (response.status === 404) {
    response = await fetch(`${base}/branches/default`, { headers: server.headers });
  }
  if (!response.ok) {
    throw new Error(`Failed to read the default branch (${response.status})`);
  }
  const body = (await response.json()) as { displayId?: string };
  if (!body.displayId) {
    throw new Error('Bitbucket did not return a default branch');
  }
  return body.displayId;
};

const latestCommit = async (
  server: BitbucketServer,
  project: string,
  repository: string,
  branch: string,
) => {
  const until = encodeURIComponent(`refs/heads/${branch}`);
  const response = await fetch(
    `${server.apiBaseUrl}/projects/${encodeURIComponent(project)}/repos/${encodeURIComponent(repository)}/commits?until=${until}&limit=1`,
    { headers: server.headers },
  );
  if (!response.ok) {
    throw new Error(`Failed to read the latest commit (${response.status})`);
  }
  const body = (await response.json()) as { values?: Array<{ id?: string }> };
  const id = body.values?.[0]?.id;
  if (!id) {
    throw new Error('Bitbucket did not return a commit to update');
  }
  return id;
};

const writeRemoteFile = async (
  server: BitbucketServer,
  path: string,
  content: string,
) => {
  const branch = await branchName(
    server,
    DEPLOYMENT_OUTPUT_PROJECT,
    DEPLOYMENT_OUTPUT_REPOSITORY,
  );
  const sourceCommitId = await latestCommit(
    server,
    DEPLOYMENT_OUTPUT_PROJECT,
    DEPLOYMENT_OUTPUT_REPOSITORY,
    branch,
  );
  const browsePath = path.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(
    `${server.apiBaseUrl}/projects/${encodeURIComponent(DEPLOYMENT_OUTPUT_PROJECT)}/repos/${encodeURIComponent(DEPLOYMENT_OUTPUT_REPOSITORY)}/browse/${browsePath}`,
    {
      method: 'PUT',
      headers: {
        ...server.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        content,
        message: `Update ${path}`,
        branch,
        sourceCommitId,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to write ${path} (${response.status})`);
  }
};

/** Reads the properties template from Bitbucket and commits the filled file. */
export const createCdDeploymentService = ({
  config,
  logger,
}: {
  config: RootConfigService;
  logger: LoggerService;
}): CdDeploymentService => ({
  async createPropertiesFile(request) {
    const server = requireBitbucketServer(config);
    const appCode = fileSegment(
      request.appCode || request.values.APP_CODE,
      'App code',
    );
    const moduleName = fileSegment(request.values.MODULE_NAME, 'Module name');
    const path = deploymentPropertiesPath(appCode, moduleName);
    const template = await readRemoteTemplate(server);
    const content = renderDeploymentProperties(template, {
      ...request,
      appCode,
    });
    await writeRemoteFile(server, path, content);
    logger.info(
      `Wrote ${DEPLOYMENT_OUTPUT_PROJECT}/${DEPLOYMENT_OUTPUT_REPOSITORY}/${path}`,
    );
    return {
      project: DEPLOYMENT_OUTPUT_PROJECT,
      repository: DEPLOYMENT_OUTPUT_REPOSITORY,
      path,
      content,
      written: true,
    };
  },
});
