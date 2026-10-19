import { PIPELINES_PATH } from '../types';

export const CREATE_PIPELINE_PATH = `${PIPELINES_PATH}/create`;
export const CREATE_ONBOARD_PATH = `${CREATE_PIPELINE_PATH}/onboard`;

export const reonboardPath = (pipelineId: string) =>
  `${PIPELINES_PATH}/${pipelineId}/reonboard`;

export const reonboardOnboardPath = (pipelineId: string) =>
  `${reonboardPath(pipelineId)}/onboard`;

export type WizardDraft = {
  targetId?: string;
  platformId?: string;
  typeId?: string;
  step: number;
};

export const toOnboardSearch = (draft: WizardDraft) => {
  const params = new URLSearchParams();
  if (draft.targetId) {
    params.set('target', draft.targetId);
  }
  if (draft.platformId) {
    params.set('platform', draft.platformId);
  }
  if (draft.typeId) {
    params.set('type', draft.typeId);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
};

export const readOnboardSearch = (search: string): WizardDraft => {
  const params = new URLSearchParams(search);
  return {
    targetId: params.get('target') || undefined,
    platformId: params.get('platform') || undefined,
    typeId: params.get('type') || undefined,
    step: params.get('platform') === 'others' ? 1 : 2,
  };
};
