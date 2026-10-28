import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

/** Frontend plugin for pipeline pages. */
export const pipelinePlugin = createPlugin({
  id: 'pipeline',
  routes: {
    root: rootRouteRef,
  },
});

export const PipelinePage = pipelinePlugin.provide(
  createRoutableExtension({
    name: 'PipelineDashboard',
    component: () =>
      import('./components/PipelineDashboard').then(m => m.PipelineDashboard),
    mountPoint: rootRouteRef,
  }),
);
