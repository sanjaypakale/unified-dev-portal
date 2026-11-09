import { DeploymentSchemaDocuments } from './deploymentSchemaSource';
import { DeploymentSchema, FieldGroup } from './types';

const groupsForProvider = (cloudGroups: FieldGroup[], cloudProvider?: string) => {
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

/** Builds the form schema and appends a cloud provider schema when one exists. */
export const readDeploymentSchema = (
  documents: DeploymentSchemaDocuments,
  options?: {
    method?: string;
    cloudProvider?: string;
  },
): DeploymentSchema => {
  const groups = [
    ...documents.openshift.groups,
    ...groupsForProvider(documents.cloudGroups, options?.cloudProvider),
  ];
  const modulePropsFilePath = modulePropsFilePathFor(options?.method);

  return {
    id: documents.openshift.id,
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
