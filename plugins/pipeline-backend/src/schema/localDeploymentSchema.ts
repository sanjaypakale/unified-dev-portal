import cloudProviderGroups from './cloud-providers.json';
import { DeploymentSchemaSource } from './deploymentSchemaSource';
import openshiftDeploymentSchema from './openshift-deployment.json';
import { DeploymentSchema, FieldGroup } from './types';

/** Local copies of the Bitbucket schema files, kept for tests. */
export const localDeploymentSchemaSource: DeploymentSchemaSource = {
  async load() {
    return {
      openshift: openshiftDeploymentSchema as DeploymentSchema,
      cloudGroups: cloudProviderGroups as FieldGroup[],
    };
  },
};
