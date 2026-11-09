import cloudProviderGroups from './cloud-providers.json';
import openshiftDeploymentSchema from './openshift-deployment.json';
import { DeploymentSchema, FieldGroup } from './types';

const cloudGroups = cloudProviderGroups as FieldGroup[];

const groupsForProvider = (cloudProvider?: string) => {
  if (!cloudProvider) {
    return [];
  }
  return cloudGroups.filter(group => {
    const when = group.when;
    return (
      when !== undefined &&
      'context' in when &&
      when.context === 'cloudProvider' &&
      when.equals === cloudProvider
    );
  });
};

const modulePropsFilePathFor = (method?: string) =>
  method === 'helm' ? 'Chart.yaml' : 'Version.properties';

/** Loads the shared deployment schema and appends a cloud provider schema when one exists. */
export const readDeploymentSchema = (options?: {
  method?: string;
  cloudProvider?: string;
}): DeploymentSchema => {
  const base = openshiftDeploymentSchema as DeploymentSchema;
  const groups = [...base.groups, ...groupsForProvider(options?.cloudProvider)];
  const modulePropsFilePath = modulePropsFilePathFor(options?.method);

  return {
    id: base.id,
    groups: groups.map(group => ({
      ...group,
      fields: group.fields.map(field =>
        field.key === 'MODULE_PROPS_FILE_PATH'
          ? { ...field, output: { constant: modulePropsFilePath } }
          : field,
      ),
    })),
  };
};
