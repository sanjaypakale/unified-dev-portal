import { useEffect, useState } from 'react';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { DeploymentSchema } from './schema';

export const useDeploymentSchema = (options: {
  enabled: boolean;
  method?: string;
  cloudProvider?: string;
}) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [schema, setSchema] = useState<DeploymentSchema>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(options.enabled);

  useEffect(() => {
    if (!options.enabled) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(undefined);

    const load = async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('pipeline');
        const params = new URLSearchParams();
        if (options.method) {
          params.set('method', options.method);
        }
        if (options.cloudProvider) {
          params.set('cloudProvider', options.cloudProvider);
        }
        const query = params.toString();
        const response = await fetchApi.fetch(
          `${baseUrl}/schemas${query ? `?${query}` : ''}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Schema request failed (${response.status})`);
        }
        const data = (await response.json()) as DeploymentSchema;
        if (active) {
          setSchema(data);
        }
      } catch (loadError) {
        if (!active || controller.signal.aborted) {
          return;
        }
        setSchema(undefined);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load the deployment form.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [
    discoveryApi,
    fetchApi,
    options.cloudProvider,
    options.enabled,
    options.method,
  ]);

  return { schema, error, loading };
};
