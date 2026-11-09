import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createCdDeploymentService } from './cd-deploymentService';
import { createBitbucketCatalog } from './bitbucket/bitbucketCatalog';
import { readBitbucketServer } from './bitbucket/bitbucketServer';
import { createBitbucketDeploymentSchemaSource } from './schema/bitbucketDeploymentSchema';
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
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, logger, database, config }) {
        const store = await createOnboardingStore(
          (await database.getClient()) as Parameters<
            typeof createOnboardingStore
          >[0],
        );
        const server = readBitbucketServer(config);
        const cdDeployment = createCdDeploymentService({ config, logger });
        httpRouter.use(
          await createRouter({
            logger,
            store,
            config,
            schemaSource: server
              ? createBitbucketDeploymentSchemaSource(server, logger)
              : undefined,
            catalog: server ? createBitbucketCatalog(server) : undefined,
            cdDeployment,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
