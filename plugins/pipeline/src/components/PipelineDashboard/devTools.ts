export type DevTool = {
  id: string;
  title: string;
  description: string;
  path: string;
  actionLabel: string;
};

/** Self-service actions shown on the pipeline dashboard. */
export const DEV_TOOLS: DevTool[] = [
  {
    id: 'devops-onboarding',
    title: 'Devops Onboarding',
    description:
      'Onboard an application by choosing the deployment target, platform, and method.',
    path: '/pipeline/cd-pipeline/create',
    actionLabel: 'Start',
  },
  {
    id: 'create-jenkins-agent',
    title: 'Create Jenkins Agent',
    description: 'Create a Jenkins agent for application builds.',
    path: '/pipeline/create-jenkins-agent',
    actionLabel: 'Create',
  },
  {
    id: 'cddeployment',
    title: 'Continuous Delivery Workflow',
    description: 'Create a continuous delivery pipeline for an application.',
    path: '/pipeline/cd-pipeline',
    actionLabel: 'Create Pipeline',
  },
];
