import { readFile } from 'fs/promises';
import nunjucks from 'nunjucks';
import { LoggerService, resolvePackagePath, RootConfigService } from '@backstage/backend-plugin-api';
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

const readBitbucketServer = (
  config: RootConfigService,
): BitbucketServer | undefined => {
  const server = config.getOptionalConfigArray('integrations.bitbucketServer')?.[0];
  if (!server) {
    return undefined;
  }
  const host = server.getString('host');
  const apiBaseUrl = (
    server.getOptionalString('apiBaseUrl') ?? `https://${host}/rest/api/1.0`
  ).replace(/\/$/, '');
  const token = server.getOptionalString('token');
  const username = server.getOptionalString('username');
  const password = server.getOptionalString('password');
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }
  return { apiBaseUrl, headers };
};

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

const localTemplatePath = () =>
  resolvePackagePath(
    '@internal/plugin-pipeline-backend',
    'src/schema/output/deployment.properties',
  );

const readLocalTemplate = () => readFile(localTemplatePath(), 'utf8');

const rawUrl = (server: BitbucketServer, project: string, repository: string, path: string) =>
  `${server.apiBaseUrl}/projects/${encodeURIComponent(project)}/repos/${encodeURIComponent(repository)}/raw/${path}`;

const readRemoteTemplate = async (server: BitbucketServer) => {
  const response = await fetch(
    rawUrl(server, BITBUCKET_SCHEMA_PROJECT, BITBUCKET_SCHEMA_REPOSITORY, DEPLOYMENT_TEMPLATE_PATH),
    { headers: server.headers },
  );
  if (!response.ok) {
    throw new Error(
      `Failed to read ${DEPLOYMENT_TEMPLATE_PATH} (${response.status})`,
    );
  }
  return response.text();
};

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

/** Reads the properties template, fills it, and stores the file in Bitbucket when configured. */
export const createCdDeploymentService = ({
  config,
  logger,
}: {
  config: RootConfigService;
  logger: LoggerService;
}): CdDeploymentService => {
  const server = readBitbucketServer(config);
  return {
    async createPropertiesFile(request) {
      const appCode = fileSegment(
        request.appCode || request.values.APP_CODE,
        'App code',
      );
      const moduleName = fileSegment(request.values.MODULE_NAME, 'Module name');
      const path = deploymentPropertiesPath(appCode, moduleName);
      let template: string;
      if (server) {
        try {
          template = await readRemoteTemplate(server);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'read failed';
          logger.info(`${message}. Using the local deployment properties template.`);
          template = await readLocalTemplate();
        }
      } else {
        logger.info(
          'integrations.bitbucketServer is not configured. The properties file was rendered and not written.',
        );
        template = await readLocalTemplate();
      }
      const content = renderDeploymentProperties(template, {
        ...request,
        appCode,
      });
      if (server) {
        await writeRemoteFile(server, path, content);
        logger.info(
          `Wrote ${DEPLOYMENT_OUTPUT_PROJECT}/${DEPLOYMENT_OUTPUT_REPOSITORY}/${path}`,
        );
      }
      return {
        project: DEPLOYMENT_OUTPUT_PROJECT,
        repository: DEPLOYMENT_OUTPUT_REPOSITORY,
        path,
        content,
        written: Boolean(server),
      };
    },
  };
};
