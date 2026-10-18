import { ConfigReader } from '@backstage/config';
import { configApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { CreatePipelineWizard } from './CreatePipelineWizard';
import { OnboardApplicationPage } from './OnboardApplicationPage';

const configApi = new ConfigReader({
  pipelines: {
    cloudProviders: [
      { id: 'aws', title: 'AWS', icon: 'aws', deploymentType: 'Cloud (AWS)' },
      { id: 'azure', title: 'Azure', icon: 'azure', deploymentType: 'Cloud (Azure)' },
      { id: 'gcp', title: 'GCP', icon: 'gcp', deploymentType: 'Cloud (GCP)' },
      { id: 'oci', title: 'OCI', icon: 'cloud', deploymentType: 'Cloud (OCI)' },
    ],
  },
});

const renderWizard = (initialPath = '/pipelines/create') => {
  render(
    wrapInTestApp(
      <TestApiProvider apis={[[configApiRef, configApi]]}>
        <Routes>
          <Route
            path="/pipelines/create/:workloadId/:platformId/:typeId/onboard"
            element={<OnboardApplicationPage />}
          />
          <Route path="/pipelines/create/*" element={<CreatePipelineWizard />} />
          <Route path="/pipelines/create" element={<CreatePipelineWizard />} />
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
    expect(
      screen.getByRole('button', { name: 'OpenShift Container Service' }),
    ).toBeInTheDocument();
    clickCard('VM or Bare Metal');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(
      screen.getByText('This deployment type is not available yet.'),
    ).toBeInTheDocument();
  });

  it('walks OpenShift Container Service through to the onboard page', async () => {
    renderWizard();

    expect(
      await screen.findByRole('button', { name: 'OpenShift Container Service' }),
    ).toBeInTheDocument();
    clickCard('OpenShift Container Service');
    clickNext();

    expect(
      await screen.findByRole('button', { name: 'Container Service' }),
    ).toBeInTheDocument();
    clickCard('Container Service');
    clickNext();

    expect(await screen.findByRole('button', { name: 'Kustomize' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Customize' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Other' })).toBeInTheDocument();
    clickCard('Kustomize');
    clickNext();

    expect(
      await screen.findByRole('heading', { name: 'Onboard the application' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('OpenShift Container Service / Container Service / Kustomize'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/AppCode/)).not.toBeInTheDocument();
  });

  it('lists cloud providers from app config', async () => {
    renderWizard('/pipelines/create/openshift-container/cloud');

    expect(await screen.findByRole('button', { name: 'OCI' })).toBeInTheDocument();
    clickCard('OCI');
    clickNext();
    expect(
      await screen.findByText(
        'OpenShift Container Service / Cloud / Cloud (OCI)',
      ),
    ).toBeInTheDocument();
  });

  it('returns to the previous step', async () => {
    renderWizard('/pipelines/create/openshift-container');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(
      await screen.findByRole('button', { name: 'OpenShift Container Service' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
