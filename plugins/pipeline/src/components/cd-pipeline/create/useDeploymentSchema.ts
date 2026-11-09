import { useEffect, useState } from 'react';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { DeploymentSchema } from './schema';

export const useDeploymentSchema = (options: { enabled: boolean }) => {
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
        const response = await fetchApi.fetch(`${baseUrl}/schemas`, {
          signal: controller.signal,
        });
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
    options.enabled,
  ]);

  return { schema, error, loading };
};
