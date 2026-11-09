/** Bitbucket Server location of the deployment form schemas. */
export const BITBUCKET_SCHEMA_PROJECT = 'gbtdpsddp';
export const BITBUCKET_SCHEMA_REPOSITORY = 'developerportal';
export const OPENSHIFT_SCHEMA_PATH =
  'config/cd-deployment/schema/openshift-deployment.json';
export const CLOUD_PROVIDER_SCHEMA_PATH =
  'config/cd-deployment/schema/cloud-provider.json';

/** Nunjucks template for the generated properties file, in the schema repository. */
export const DEPLOYMENT_TEMPLATE_PATH =
  'config/cd-deployment/output/deployment.properties';

/** Repository that receives one properties file per onboarded module. */
export const DEPLOYMENT_OUTPUT_PROJECT = 'DVO';
export const DEPLOYMENT_OUTPUT_REPOSITORY = 'deployment-workflow';

export const deploymentPropertiesPath = (appCode: string, moduleName: string) =>
  `${appCode}/cd_depoloyment_${moduleName}.properties`;
