import cloudProviderGroups from './cloud-providers.json';
import { combineSchemaFiles, DeploymentSchemaSource } from './deploymentSchemaSource';
import openshiftDeploymentSchema from './openshift-deployment.json';

/** Local copies of the Bitbucket schema files, kept for tests. */
export const localDeploymentSchemaSource: DeploymentSchemaSource = {
  async load() {
    return combineSchemaFiles(openshiftDeploymentSchema, cloudProviderGroups);
  },
};
