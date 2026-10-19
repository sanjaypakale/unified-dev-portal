export type WizardOption = {
  id: string;
  title: string;
  icon: string;
  available?: boolean;
  deploymentTypeLabel?: string;
};

export const DEPLOYMENT_TARGET_STEP = 'Select Deployment Target';
export const CONTAINER_PLATFORM_STEP = 'Select Container Platform Type';
export const OPENSHIFT_METHOD_STEP = 'Select Red Hat Openshift Deployment Method';
export const CLOUD_PROVIDER_STEP = 'Select Cloud Provider';

export const CONTAINER_SERVICE_ID = 'container-service';
export const OPENSHIFT_PLATFORM_ID = 'openshift';
export const CLOUD_PLATFORM_ID = 'cloud';
export const OTHERS_PLATFORM_ID = 'others';

export const DEPLOYMENT_TARGET_OPTIONS: WizardOption[] = [
  {
    id: CONTAINER_SERVICE_ID,
    title: 'Container Service',
    icon: 'container-service',
  },
  {
    id: 'vmOrBareMetal',
    title: 'VM or Bare Metal',
    icon: 'vm',
    available: false,
  },
];

export const PLATFORM_OPTIONS: WizardOption[] = [
  {
    id: OPENSHIFT_PLATFORM_ID,
    title: 'Red Hat Openshift',
    icon: 'openshift',
  },
  {
    id: CLOUD_PLATFORM_ID,
    title: 'Cloud',
    icon: 'cloud',
  },
  {
    id: OTHERS_PLATFORM_ID,
    title: 'Others',
    icon: 'other',
    deploymentTypeLabel: 'Others',
  },
];

export const OPENSHIFT_METHOD_OPTIONS: WizardOption[] = [
  {
    id: 'kustomize',
    title: 'Kustomize',
    icon: 'kustomize',
    deploymentTypeLabel: 'Kustomize',
  },
  {
    id: 'helm',
    title: 'Helm',
    icon: 'helm',
    deploymentTypeLabel: 'Helm',
  },
  {
    id: 'kubernetes-manifest',
    title: 'Kubernetes Manifest',
    icon: 'kubernetes-manifest',
    deploymentTypeLabel: 'Kubernetes Manifest',
  },
];

export const findOption = (options: WizardOption[], id?: string) =>
  options.find(option => option.id === id);

const matchesDeploymentLabel = (option: WizardOption, label: string) =>
  option.deploymentTypeLabel === label ||
  option.title === label ||
  `Cloud (${option.title})` === label;

export const draftFromDeploymentType = (
  deploymentType: string | undefined,
  cloudOptions: WizardOption[],
): { targetId?: string; platformId?: string; typeId?: string } => {
  const label = deploymentType || '';
  const method = OPENSHIFT_METHOD_OPTIONS.find(option =>
    matchesDeploymentLabel(option, label),
  );
  if (method) {
    return {
      targetId: CONTAINER_SERVICE_ID,
      platformId: OPENSHIFT_PLATFORM_ID,
      typeId: method.id,
    };
  }
  const cloud = cloudOptions.find(option => matchesDeploymentLabel(option, label));
  if (cloud) {
    return {
      targetId: CONTAINER_SERVICE_ID,
      platformId: CLOUD_PLATFORM_ID,
      typeId: cloud.id,
    };
  }
  if (label === 'Others') {
    return {
      targetId: CONTAINER_SERVICE_ID,
      platformId: OTHERS_PLATFORM_ID,
      typeId: OTHERS_PLATFORM_ID,
    };
  }
  return {};
};
