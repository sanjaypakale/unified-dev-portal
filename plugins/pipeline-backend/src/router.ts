import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {
  CdDeploymentService,
  createCdDeploymentService,
} from './cd-deploymentService';
import {
  listBitbucketProjects,
  listBitbucketRepositories,
} from './bitbucket/listBitbucketCatalog';
import {
  createMemoryOnboardingStore,
  OnboardingStore,
} from './onboardingStore';
import { localDeploymentSchemaSource } from './schema/localDeploymentSchema';
import { DeploymentSchemaSource } from './schema/deploymentSchemaSource';
import { readDeploymentSchema } from './schema/readDeploymentSchema';

const queryValue = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const stringValues = (values: unknown) =>
  Object.fromEntries(
    Object.entries(values as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

const textValue = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

/** Creates the pipeline backend HTTP router. */
export async function createRouter({
  logger,
  store,
  schemaSource = localDeploymentSchemaSource,
  config,
  cdDeployment,
}: {
  logger: LoggerService;
  store?: OnboardingStore;
  schemaSource?: DeploymentSchemaSource;
  config?: RootConfigService;
  cdDeployment?: CdDeploymentService;
}): Promise<express.Router> {
  const records = store ?? createMemoryOnboardingStore();
  const deployment =
    cdDeployment ??
    createCdDeploymentService({
      config:
        config ??
        ({
          getOptionalConfigArray: () => undefined,
        } as unknown as RootConfigService),
      logger,
    });
  const router = Router();
  router.use(express.json());

  router.get('/health', (_request, response) => {
    logger.info('Pipeline backend health check');
    response.json({ status: 'ok' });
  });

  router.get('/bitbucket/projects', (_request, response) => {
    response.json(listBitbucketProjects());
  });

  router.get('/bitbucket/projects/:projectKey/repositories', (request, response) => {
    response.json(listBitbucketRepositories(request.params.projectKey));
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
  });

  router.get('/pipelines', async (_request, response) => {
    response.json(await records.list());
  });

  router.get('/schemas', async (request, response) => {
    const documents = await schemaSource.load();
    response.json(
      readDeploymentSchema(documents, {
        method: queryValue(request.query.method),
        cloudProvider: queryValue(request.query.cloudProvider),
      }),
    );
  });

  return router;
}
