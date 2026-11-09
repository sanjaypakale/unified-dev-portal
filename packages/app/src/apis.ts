import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  PipelineApiClient,
  authServiceApiRef,
  ddpApiRef as pipelineDdpApiRef,
} from '@internal/plugin-pipeline';
import { AuthService } from './api/AuthService';
import { DdpApiClient, ddpApiRef } from './api/DdpApi';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: ddpApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
    },
    factory: ({ discoveryApi, fetchApi }) =>
      new DdpApiClient(discoveryApi, fetchApi),
  }),
  createApiFactory({
    api: authServiceApiRef,
    deps: {},
    factory: () => new AuthService(),
  }),
  createApiFactory({
    api: pipelineDdpApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
    },
    factory: ({ discoveryApi, fetchApi }) =>
      new PipelineApiClient({ discoveryApi, fetchApi }),
  }),
];
