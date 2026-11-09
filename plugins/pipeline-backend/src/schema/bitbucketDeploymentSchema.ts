import { LoggerService } from '@backstage/backend-plugin-api';
import { BitbucketServer, readBitbucketJson } from '../bitbucket/bitbucketServer';
import { combineSchemaFiles, DeploymentSchemaSource } from './deploymentSchemaSource';
import {
  BITBUCKET_SCHEMA_PROJECT,
  BITBUCKET_SCHEMA_REPOSITORY,
  CLOUD_PROVIDER_SCHEMA_PATH,
  OPENSHIFT_SCHEMA_PATH,
} from './schemaLocation';

/** Reads the deployment schema files from the developerportal repository. */
export const createBitbucketDeploymentSchemaSource = (
  server: BitbucketServer,
  logger: LoggerService,
): DeploymentSchemaSource => ({
  async load() {
    logger.info(
      `Loading deployment schemas from ${BITBUCKET_SCHEMA_PROJECT}/${BITBUCKET_SCHEMA_REPOSITORY}`,
    );
    const [openshift, cloudGroups] = await Promise.all([
      readBitbucketJson(server, BITBUCKET_SCHEMA_PROJECT, BITBUCKET_SCHEMA_REPOSITORY, OPENSHIFT_SCHEMA_PATH),
      readBitbucketJson(server, BITBUCKET_SCHEMA_PROJECT, BITBUCKET_SCHEMA_REPOSITORY, CLOUD_PROVIDER_SCHEMA_PATH),
    ]);
    return combineSchemaFiles(openshift, cloudGroups);
  },
});
