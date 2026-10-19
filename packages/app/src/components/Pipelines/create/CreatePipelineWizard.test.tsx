import { ConfigReader } from '@backstage/config';
import { configApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DdpApi, ddpApiRef, Pipeline } from '../../../api/DdpApi';
import { CreatePipelineWizard } from './CreatePipelineWizard';
import { OnboardApplicationPage } from './OnboardApplicationPage';

const configApi = new ConfigReader({
  pipelines: {
    cloudProviders: 'AWS, AZURE, GCP, OCI',
  },
});

const Pathname = () => {
  const { pathname } = useLocation();
  return <div data-testid="pathname">{pathname}</div>;
};

const renderWizard = (
  initialPath = '/pipelines/create',
  pipelines: Pipeline[] = [],
) => {
  const ddpApi = {
    getAllPipelines: jest.fn(async () => pipelines),
  } as unknown as DdpApi;

  render(
    wrapInTestApp(
      <TestApiProvider
        apis={[
          [configApiRef, configApi],
          [ddpApiRef, ddpApi],
        ]}
      >
        <Pathname />
        <Routes>
          <Route path="/pipelines/create/onboard" element={<OnboardApplicationPage />} />
          <Route
            path="/pipelines/:pipelineId/reonboard/onboard"
            element={<OnboardApplicationPage />}
          />
          <Route path="/pipelines/create" element={<CreatePipelineWizard />} />
          <Route
            path="/pipelines/:pipelineId/reonboard"
            element={<CreatePipelineWizard />}
          />
        </Routes>
      </TestApiProvider>,
      { routeEntries: [initialPath] },
    ),
  );
};

const clickCard = (name: string) => {
  fireEvent.click(screen.getByRole('button', { name }));
};

const clickNext = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
};

describe('Create pipeline wizard', () => {
  it('keeps Next disabled for VM or Bare Metal', async () => {
    renderWizard();

    expect(await screen.findByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByText('What do you want to deploy?')).toBeInTheDocument();
    expect(screen.getByText('Onboard the application')).toBeInTheDocument();
    expect(screen.queryByText('Container platform')).not.toBeInTheDocument();
    clickCard('VM or Bare Metal');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(
      screen.getByText('This deployment type is not available yet.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/pipelines\/create$/);
  });

  it('reveals later choices in the same step', async () => {
    renderWizard();

    expect(
      await screen.findByRole('button', { name: 'Container Service' }),
    ).toBeInTheDocument();
    clickCard('Container Service');
    expect(screen.getByRole('button', { name: 'Red Hat Openshift' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cloud' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Others' })).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/pipelines\/create$/);

    clickCard('Red Hat Openshift');
    expect(screen.getByRole('button', { name: 'Kustomize' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Helm' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Kubernetes Manifest' }),
    ).toBeInTheDocument();
    clickCard('Helm');
    clickNext();

    expect(
      await screen.findByRole('heading', { name: 'Onboard the application' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Container Service / Red Hat Openshift / Helm'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent(
      '/pipelines/create/onboard',
    );
  });

  it('lists cloud providers from app config in the same panel', async () => {
    renderWizard();

    expect(
      await screen.findByRole('button', { name: 'Container Service' }),
    ).toBeInTheDocument();
    clickCard('Container Service');
    clickCard('Cloud');
    expect(screen.getByText('Cloud provider')).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/pipelines\/create$/);
    expect(screen.getByRole('button', { name: 'AWS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AZURE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GCP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OCI' })).toBeInTheDocument();
    clickCard('OCI');
    clickNext();
    expect(
      await screen.findByText('Container Service / Cloud / OCI'),
    ).toBeInTheDocument();
  });

  it('opens reonboard with every saved choice visible and allows a different option', async () => {
    renderWizard('/pipelines/1/reonboard', [
      {
        id: '1',
        appCode: 'PAY',
        bitbucketProjectName: 'PAY',
        moduleName: 'payments-service',
        deploymentType: 'Kustomize',
      },
    ]);

    expect(
      await screen.findByRole('button', { name: 'Container Service' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Reonboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Red Hat Openshift' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Kustomize' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    clickCard('Cloud');
    expect(screen.queryByRole('button', { name: 'Kustomize' })).not.toBeInTheDocument();
    clickCard('AWS');
    clickNext();
    expect(
      await screen.findByText('Container Service / Cloud / AWS'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent(
      '/pipelines/1/reonboard/onboard',
    );
  });
});
