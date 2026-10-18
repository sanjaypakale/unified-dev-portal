import { PIPELINES_PATH } from '../types';

export const CREATE_PIPELINE_PATH = `${PIPELINES_PATH}/create`;

export const readWizardPath = (pathname: string) => {
  const rest = pathname.startsWith(`${CREATE_PIPELINE_PATH}/`)
    ? pathname.slice(CREATE_PIPELINE_PATH.length + 1)
    : '';
  const [workloadId, platformId, typeId] = rest
    .split('/')
    .filter(part => part && part !== 'onboard');
  return { workloadId, platformId, typeId };
};

export const wizardPath = (...ids: Array<string | undefined>) =>
  [CREATE_PIPELINE_PATH, ...ids.filter((id): id is string => Boolean(id))].join(
    '/',
  );
