import { FieldGroup } from './schema';

export type OnboardStepId = 'repository' | 'deployment' | 'cloud' | 'review';

export type OnboardStep = {
  id: OnboardStepId;
  label: string;
};

/** Repository, the wizard's deployment fields, cloud only when selected, then review. */
export const buildOnboardSteps = (options: {
  deploymentLabel?: string;
  cloudLabel?: string;
}): OnboardStep[] => {
  const steps: OnboardStep[] = [
    { id: 'repository', label: 'Repository' },
    { id: 'deployment', label: options.deploymentLabel || 'Deployment' },
  ];
  if (options.cloudLabel) {
    steps.push({ id: 'cloud', label: options.cloudLabel });
  }
  steps.push({ id: 'review', label: 'Review' });
  return steps;
};

export const groupsForStep = (groups: FieldGroup[], stepId: OnboardStepId) =>
  groups.filter(group => (group.step ?? 'deployment') === stepId);
