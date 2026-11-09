import { useEffect, useState } from 'react';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { FieldControl } from './FieldControl';
import { DeploymentField, FieldOption } from './schema';

type RemoteSelectProps = {
  field: DeploymentField;
  value?: string;
  required: boolean;
  parentValue?: string;
  forceError?: boolean;
  onChange: (value: string) => void;
};

const toOptions = (
  source: DeploymentField['optionsSource'],
  payload: unknown,
): FieldOption[] => {
  if (!Array.isArray(payload)) {
    return [];
  }
  if (source === 'bitbucket-projects') {
    return payload.flatMap(item => {
      if (!item || typeof item !== 'object') {
        return [];
      }
      const project = item as { key?: unknown; name?: unknown };
      if (typeof project.key !== 'string' || typeof project.name !== 'string') {
        return [];
      }
      return [{ value: project.key, label: project.name }];
    });
  }
  return payload.flatMap(item => {
    if (!item || typeof item !== 'object') {
      return [];
    }
    const repository = item as { name?: unknown };
    if (typeof repository.name !== 'string') {
      return [];
    }
    return [{ value: repository.name, label: repository.name }];
  });
};

export const RemoteSelect = ({
  field,
  value,
  required,
  parentValue,
  forceError = false,
  onChange,
}: RemoteSelectProps) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
    const source = field.optionsSource;
    const waitingForParent = Boolean(field.dependsOn) && !parentValue;

  useEffect(() => {
    if (waitingForParent) {
      setOptions([]);
      setLoading(false);
      setError(undefined);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(undefined);

    const load = async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('pipeline');
        const path =
          source === 'bitbucket-repositories'
            ? `/bitbucket/projects/${encodeURIComponent(parentValue ?? '')}/repositories`
            : '/bitbucket/projects';
        const response = await fetchApi.fetch(`${baseUrl}${path}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Bitbucket request failed (${response.status})`);
        }
        const data = await response.json();
        if (active) {
          setOptions(toOptions(source, data));
        }
      } catch (loadError) {
        if (!active || controller.signal.aborted) {
          return;
        }
        setOptions([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load Bitbucket options.',
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
    source,
    parentValue,
    waitingForParent,
  ]);

  return (
    <FieldControl
      field={{ ...field, options }}
      value={value}
      required={required}
      disabled={waitingForParent || loading}
      forceError={forceError}
      helperText={
        error ??
        (waitingForParent
          ? 'Select a Bitbucket project name first.'
          : loading
            ? 'Loading...'
            : undefined)
      }
      onChange={onChange}
    />
  );
};
