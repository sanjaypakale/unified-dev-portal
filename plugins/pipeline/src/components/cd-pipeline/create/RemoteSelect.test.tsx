import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RemoteSelect } from './RemoteSelect';
import { DeploymentField } from './schema';

const projectField: DeploymentField = {
  key: 'BITBUCKET_PROJECT_NAME',
  label: 'Bitbucket Project Name',
  widget: 'select',
  required: true,
  optionsSource: 'bitbucket-projects',
};

const repositoryField: DeploymentField = {
  key: 'MODULE_NAME',
  label: 'Bitbucket Repository Name',
  widget: 'select',
  required: true,
  optionsSource: 'bitbucket-repositories',
  dependsOn: 'BITBUCKET_PROJECT_NAME',
};

const apis = [
  [discoveryApiRef, { getBaseUrl: async () => 'http://pipeline.test' }],
  [
    fetchApiRef,
    {
      fetch: async (url: string) => ({
        ok: true,
        json: async () =>
          String(url).endsWith('/repositories')
            ? [{ name: 'payments-service' }]
            : [{ key: 'PAY', name: 'PAY' }],
      }),
    },
  ],
] as const;

const renderSelect = (field: DeploymentField, parentValue?: string) =>
  render(
    <TestApiProvider apis={apis as unknown as Array<[any, any]>}>
      <ThemeProvider theme={lightTheme}>
        <RemoteSelect
          field={field}
          required
          parentValue={parentValue}
          onChange={jest.fn()}
        />
      </ThemeProvider>
    </TestApiProvider>,
  );

describe('RemoteSelect', () => {
  it('loads Bitbucket project names', async () => {
    renderSelect(projectField);
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    fireEvent.mouseDown(document.getElementById('BITBUCKET_PROJECT_NAME')!);
    expect(await screen.findByRole('option', { name: 'PAY' })).toBeInTheDocument();
  });

  it('loads repositories only after a project is selected', async () => {
    const view = renderSelect(repositoryField);
    expect(
      screen.getByText('Select a Bitbucket project name first.'),
    ).toBeInTheDocument();

    view.rerender(
      <TestApiProvider apis={apis as unknown as Array<[any, any]>}>
        <ThemeProvider theme={lightTheme}>
          <RemoteSelect
            field={repositoryField}
            required
            parentValue="PAY"
            onChange={jest.fn()}
          />
        </ThemeProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    fireEvent.mouseDown(document.getElementById('MODULE_NAME')!);
    expect(
      await screen.findByRole('option', { name: 'payments-service' }),
    ).toBeInTheDocument();
  });
});
