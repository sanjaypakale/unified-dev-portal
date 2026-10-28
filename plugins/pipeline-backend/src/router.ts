import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { readDeploymentSchema } from './schema/readDeploymentSchema';

const queryValue = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/** Creates the pipeline backend HTTP router. */
export async function createRouter({
  logger,
}: {
  logger: LoggerService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/health', (_request, response) => {
    logger.info('Pipeline backend health check');
    response.json({ status: 'ok' });
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
