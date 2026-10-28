import { pipelinePlugin } from './plugin';

describe('pipeline plugin', () => {
  it('uses the pipeline plugin id', () => {
    expect(pipelinePlugin.getId()).toBe('pipeline');
  });
});
