import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createOnboardingStore } from './onboardingStore';
import { createRouter } from './router';

/**
 * Pipeline backend plugin.
 *
 * @public
 */
export const pipelinePlugin = createBackendPlugin({
  pluginId: 'pipeline',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        database: coreServices.database,
      },
      async init({ httpRouter, logger, database }) {
        const store = await createOnboardingStore(
          (await database.getClient()) as Parameters<
            typeof createOnboardingStore
          >[0],
        );
        httpRouter.use(await createRouter({ logger, store }));
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
