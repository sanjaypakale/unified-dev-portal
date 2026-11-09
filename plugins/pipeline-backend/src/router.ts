import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {
  listBitbucketProjects,
  listBitbucketRepositories,
} from './bitbucket/listBitbucketCatalog';
import {
  createMemoryOnboardingStore,
  OnboardingStore,
} from './onboardingStore';
import { readDeploymentSchema } from './schema/readDeploymentSchema';

const queryValue = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/** Creates the pipeline backend HTTP router. */
export async function createRouter({
  logger,
  store,
}: {
  logger: LoggerService;
  store?: OnboardingStore;
}): Promise<express.Router> {
  const records = store ?? createMemoryOnboardingStore();
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
    const values = (body as { values?: unknown }).values;
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      response.status(400).json({ message: 'values are required' });
      return;
    }
    const saved = await records.save(body as Record<string, unknown>);
    logger.info(`Accepted onboarding ${saved.id}`);
    response.status(201).json({ id: saved.id, status: 'accepted' });
  });

  router.get('/pipelines', async (_request, response) => {
    response.json(await records.list());
  });

  router.get('/schemas', (request, response) => {
    response.json(
      readDeploymentSchema({
        method: queryValue(request.query.method),
        cloudProvider: queryValue(request.query.cloudProvider),
      }),
    );
  });

  return router;
}
