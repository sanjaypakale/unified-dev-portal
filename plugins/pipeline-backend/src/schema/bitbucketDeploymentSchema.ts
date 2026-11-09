import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import { combineSchemaFiles, DeploymentSchemaSource } from './deploymentSchemaSource';
import {
  BITBUCKET_SCHEMA_PROJECT,
  BITBUCKET_SCHEMA_REPOSITORY,
  CLOUD_PROVIDER_SCHEMA_PATH,
  OPENSHIFT_SCHEMA_PATH,
} from './schemaLocation';

type BitbucketServerConfig = {
  apiBaseUrl: string;
  headers: Record<string, string>;
};

const readBitbucketServer = (
  config: RootConfigService,
): BitbucketServerConfig | undefined => {
  const servers = config.getOptionalConfigArray('integrations.bitbucketServer');
  const server = servers?.[0];
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

const rawFileUrl = (apiBaseUrl: string, path: string) =>
  `${apiBaseUrl}/projects/${BITBUCKET_SCHEMA_PROJECT}/repos/${BITBUCKET_SCHEMA_REPOSITORY}/raw/${path}`;

const readJsonFile = async (
  server: BitbucketServerConfig,
  path: string,
): Promise<unknown> => {
  const url = rawFileUrl(server.apiBaseUrl, path);
  const response = await fetch(url, { headers: server.headers });
  if (!response.ok) {
    throw new Error(
      `Failed to read ${path} from ${BITBUCKET_SCHEMA_PROJECT}/${BITBUCKET_SCHEMA_REPOSITORY} (${response.status})`,
    );
  }
  return response.json();
};

export const createBitbucketDeploymentSchemaSource = (
  config: RootConfigService,
  logger: LoggerService,
): DeploymentSchemaSource | undefined => {
  const server = readBitbucketServer(config);
  if (!server) {
    return undefined;
  }
  return {
    async load() {
      logger.info(
        `Loading deployment schemas from ${BITBUCKET_SCHEMA_PROJECT}/${BITBUCKET_SCHEMA_REPOSITORY}`,
      );
      const [openshift, cloudGroups] = await Promise.all([
        readJsonFile(server, OPENSHIFT_SCHEMA_PATH),
        readJsonFile(server, CLOUD_PROVIDER_SCHEMA_PATH),
      ]);
      return combineSchemaFiles(openshift, cloudGroups);
    },
  };
};
