import { DeploymentSchema, FieldGroup } from './types';

export type DeploymentSchemaDocuments = {
  openshift: DeploymentSchema;
  cloudGroups: FieldGroup[];
};

/** Loads the OpenShift schema and the cloud-provider groups. */
export interface DeploymentSchemaSource {
  load(): Promise<DeploymentSchemaDocuments>;
}
