import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {
  CdDeploymentService,
  createCdDeploymentService,
} from './cd-deploymentService';
import { BitbucketCatalog } from './bitbucket/bitbucketCatalog';
import { BitbucketConfigError, readBitbucketServer } from './bitbucket/bitbucketServer';
import {
  createMemoryOnboardingStore,
  OnboardingStore,
} from './onboardingStore';
import { DeploymentSchemaSource } from './schema/deploymentSchemaSource';

const stringValues = (values: unknown) =>
  Object.fromEntries(
    Object.entries(values as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

const textValue = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

const unavailableSchema = (): DeploymentSchemaSource => ({
  async load() {
    throw new BitbucketConfigError();
  },
});

const unavailableCatalog = (): BitbucketCatalog => ({
  async listProjects() {
    throw new BitbucketConfigError();
  },
  async listRepositories() {
    throw new BitbucketConfigError();
  },
});

const sendBitbucketError = (response: express.Response, error: unknown) => {
  if (error instanceof BitbucketConfigError) {
    response.status(503).json({ message: error.message });
    return;
  }
  throw error;
};

/** Creates the pipeline backend HTTP router. */
export async function createRouter({
  logger,
  store,
  config,
  schemaSource,
  catalog,
  cdDeployment,
}: {
  logger: LoggerService;
  store?: OnboardingStore;
  config?: RootConfigService;
  schemaSource?: DeploymentSchemaSource;
  catalog?: BitbucketCatalog;
  cdDeployment?: CdDeploymentService;
}): Promise<express.Router> {
  const records = store ?? createMemoryOnboardingStore();
  const server = config ? readBitbucketServer(config) : undefined;
  const schemas = schemaSource ?? unavailableSchema();
  const projects = catalog ?? unavailableCatalog();
  const deployment =
    cdDeployment ??
    (server
      ? createCdDeploymentService({
          config: config as RootConfigService,
          logger,
        })
      : {
          async createPropertiesFile() {
            throw new BitbucketConfigError();
          },
        });
  const router = Router();
  router.use(express.json());

  router.get('/health', (_request, response) => {
    logger.info('Pipeline backend health check');
    response.json({ status: 'ok' });
  });

  router.get('/bitbucket/projects', async (_request, response) => {
    try {
      response.json(await projects.listProjects());
    } catch (error) {
      sendBitbucketError(response, error);
    }
  });

  router.get('/bitbucket/projects/:projectKey/repositories', async (request, response) => {
    try {
      response.json(await projects.listRepositories(request.params.projectKey));
    } catch (error) {
      sendBitbucketError(response, error);
    }
  });

  router.post('/onboard', async (request, response) => {
    const body = request.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      response.status(400).json({ message: 'Onboarding payload is required' });
      return;
    }
    const payload = body as Record<string, unknown>;
    const values = payload.values;
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      response.status(400).json({ message: 'values are required' });
      return;
    }
    try {
      const properties = await deployment.createPropertiesFile({
        appCode: textValue(payload.appCode),
        targetId: textValue(payload.targetId),
        platformId: textValue(payload.platformId),
        typeId: textValue(payload.typeId),
        values: stringValues(values),
      });
      const saved = await records.save(payload);
      logger.info(`Accepted onboarding ${saved.id}`);
      response.status(201).json({
        id: saved.id,
        status: 'accepted',
        propertiesPath: properties.path,
        propertiesWritten: properties.written,
      });
    } catch (error) {
      sendBitbucketError(response, error);
    }
  });

  router.get('/pipelines', async (_request, response) => {
    response.json(await records.list());
  });

  router.get('/schemas', async (_request, response) => {
    try {
      response.json(await schemas.load());
    } catch (error) {
      sendBitbucketError(response, error);
    }
  });

  return router;
}
