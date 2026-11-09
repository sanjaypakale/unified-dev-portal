import { createApiRef } from '@backstage/core-plugin-api';

/** Session app code used while creating a pipeline. */
export interface AuthServiceApi {
  getAppCode(): string;
}

export const authServiceApiRef = createApiRef<AuthServiceApi>({
  id: 'plugin.pipeline.auth-service',
});
