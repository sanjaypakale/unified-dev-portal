import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { DEFAULT_CLOUD_OPTIONS, WizardOption } from './wizardOptions';

const readProvider = (
  getString: (key: string) => string,
  getOptionalString: (key: string) => string | undefined,
): WizardOption => {
  const id = getString('id');
  const title = getString('title');
  return {
    id,
    title,
    icon: getOptionalString('icon') || 'cloud',
    deploymentTypeLabel:
      getOptionalString('deploymentType') || `Cloud (${title})`,
  };
};

export const useCloudProviderOptions = (): WizardOption[] => {
  const config = useApi(configApiRef);
  const configured = config.getOptionalConfigArray?.('pipelines.cloudProviders');
  if (!configured?.length) {
    return DEFAULT_CLOUD_OPTIONS;
  }

  return configured.map(entry =>
    readProvider(
      key => entry.getString(key),
      key => entry.getOptionalString(key),
    ),
  );
};
