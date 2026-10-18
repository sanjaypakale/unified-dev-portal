export type WizardOption = {
  id: string;
  title: string;
  icon: string;
  available?: boolean;
  deploymentTypeLabel?: string;
};

export const WIZARD_STEP_TITLES = [
  'What do you want to deploy?',
  'How do you want to deploy?',
  'Which deployment type?',
] as const;

export const OPENSHIFT_WORKLOAD_ID = 'openshift-container';
export const CONTAINER_SERVICE_ID = 'container-service';
export const CLOUD_PLATFORM_ID = 'cloud';

export const WORKLOAD_OPTIONS: WizardOption[] = [
  {
    id: OPENSHIFT_WORKLOAD_ID,
    title: 'OpenShift Container Service',
    icon: 'openshift',
  },
  {
    id: 'vmOrBareMetal',
    title: 'VM or Bare Metal',
    icon: 'vm',
    available: false,
  }
];

export const PLATFORM_OPTIONS: WizardOption[] = [
  {
    id: CONTAINER_SERVICE_ID,
    title: 'Container Service',
    icon: 'container-service',
  },
  {
    id: CLOUD_PLATFORM_ID,
    title: 'Cloud',
    icon: 'cloud',
  },
];

export const CONTAINER_SERVICE_OPTIONS: WizardOption[] = [
  {
    id: 'customize',
    title: 'Customize',
    icon: 'customize',
    deploymentTypeLabel: 'Customize',
  },
  {
    id: 'other',
    title: 'Other',
    icon: 'other',
    deploymentTypeLabel: 'Other',
  },
  {
    id: 'kustomize',
    title: 'Kustomize',
    icon: 'kustomize',
    deploymentTypeLabel: 'Kustomize',
  },
];

export const DEFAULT_CLOUD_OPTIONS: WizardOption[] = [
  {
    id: 'aws',
    title: 'AWS',
    icon: 'aws',
    deploymentTypeLabel: 'Cloud (AWS)',
  },
  {
    id: 'azure',
    title: 'Azure',
    icon: 'azure',
    deploymentTypeLabel: 'Cloud (Azure)',
  },
  {
    id: 'gcp',
    title: 'GCP',
    icon: 'gcp',
    deploymentTypeLabel: 'Cloud (GCP)',
  },
];

export const findOption = (options: WizardOption[], id?: string) =>
  options.find(option => option.id === id);
