import openshiftDeploymentSchema from './openshift-deployment.json';
import { DeploymentSchema } from './types';

const cloudSchemas: Record<string, DeploymentSchema> = {};

const modulePropsFilePathFor = (method?: string) =>
  method === 'helm' ? 'Chart.yaml' : 'Version.properties';

/** Loads the shared deployment schema and appends a cloud provider schema when one exists. */
export const readDeploymentSchema = (options?: {
  method?: string;
  cloudProvider?: string;
}): DeploymentSchema => {
  const base = openshiftDeploymentSchema as DeploymentSchema;
  const extra = options?.cloudProvider
    ? cloudSchemas[options.cloudProvider]
    : undefined;
  const groups = extra ? [...base.groups, ...extra.groups] : base.groups;
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
