export type DeploymentSchemaDocument = {
  id: string;
  groups: unknown[];
};

/** Joins the two schema files. Field rules stay in the files and the UI. */
export const combineSchemaFiles = (
  openshift: unknown,
  cloudGroups: unknown,
): DeploymentSchemaDocument => {
  const base = openshift as { id?: unknown; groups?: unknown };
  if (!base || typeof base !== 'object' || !Array.isArray(base.groups)) {
    throw new Error('openshift-deployment.json is not a deployment schema');
  }
  if (!Array.isArray(cloudGroups)) {
    throw new Error('cloud-provider.json is not a group list');
  }
  return {
    id: typeof base.id === 'string' ? base.id : 'openshift-deployment',
    groups: [...base.groups, ...cloudGroups],
  };
};

export interface DeploymentSchemaSource {
  load(): Promise<DeploymentSchemaDocument>;
}
