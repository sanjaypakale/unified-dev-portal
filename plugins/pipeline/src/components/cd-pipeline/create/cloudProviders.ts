import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { WizardOption } from './wizardOptions';

const DEFAULT_CLOUD_PROVIDERS = 'AWS, AZURE, GCP';

export const parseCloudProviders = (value?: string): WizardOption[] => {
  const names = (value || DEFAULT_CLOUD_PROVIDERS)
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);

  return names.map(title => {
    const id = title.toLowerCase().replace(/\s+/g, '-');
    return {
      id,
      title,
      icon: id,
      deploymentTypeLabel: title,
    };
  });
};

export const useCloudProviderOptions = (): WizardOption[] => {
  const config = useApi(configApiRef);
  return parseCloudProviders(config.getOptionalString('pipelines.cloudProviders'));
};
