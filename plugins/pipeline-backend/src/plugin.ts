import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createCdDeploymentService } from './cd-deploymentService';
import { createBitbucketDeploymentSchemaSource } from './schema/bitbucketDeploymentSchema';
import { localDeploymentSchemaSource } from './schema/localDeploymentSchema';
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
        const cdDeployment = createCdDeploymentService({ config, logger });
        const bitbucketSchema = createBitbucketDeploymentSchemaSource(
          config,
          logger,
        );
        if (!bitbucketSchema) {
          logger.info(
            'integrations.bitbucketServer is not configured. Using the local deployment schema copies.',
          );
        }
        httpRouter.use(
          await createRouter({
            logger,
            store,
            schemaSource: bitbucketSchema ?? localDeploymentSchemaSource,
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
