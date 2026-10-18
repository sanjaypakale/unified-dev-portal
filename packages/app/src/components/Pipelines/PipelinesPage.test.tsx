import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { AlertApi, alertApiRef } from '@backstage/core-plugin-api';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DdpApi, Pipeline, ddpApiRef } from '../../api/DdpApi';
import { PipelinesPage } from './PipelinesPage';

const SAMPLE_PIPELINES: Pipeline[] = [
  {
    id: '1',
    appCode: 'PAY',
    bitbucketProjectName: 'PAY',
    moduleName: 'payments-service',
    deploymentType: 'Kustomize',
  },
  {
    id: '2',
    appCode: 'IDP',
    bitbucketProjectName: 'IDP',
    moduleName: 'identity-portal',
    deploymentType: 'Cloud (AWS)',
  },
];

describe('PipelinesPage', () => {
  const getAllPipelines = jest.fn();
  const createOrUpdatePipeline = jest.fn();
  const alertApiPost = jest.fn();
  const ddpApi = {
    getAllPipelines,
    createOrUpdatePipeline,
  } as unknown as DdpApi;
  const alertApi = { post: alertApiPost } as unknown as AlertApi;

  const renderPage = () =>
    render(
      wrapInTestApp(
        <TestApiProvider
          apis={[
            [ddpApiRef, ddpApi],
            [alertApiRef, alertApi],
          ]}
        >
          <PipelinesPage />
        </TestApiProvider>,
      ),
    );

  beforeEach(() => {
    getAllPipelines.mockReset();
    createOrUpdatePipeline.mockReset();
    alertApiPost.mockReset();
    getAllPipelines.mockResolvedValue(SAMPLE_PIPELINES);
  });

  it('lists existing pipelines', async () => {
    renderPage();

    expect(await screen.findByText('payments-service')).toBeInTheDocument();
    expect(screen.getByText('identity-portal')).toBeInTheDocument();
    expect(screen.getByText('AppCode')).toBeInTheDocument();
    expect(screen.getByText('Bitbucket project name')).toBeInTheDocument();
    expect(screen.getByText('Module name')).toBeInTheDocument();
    expect(screen.getByText('Deployment type')).toBeInTheDocument();
    expect(screen.getByText('Kustomize')).toBeInTheDocument();
    expect(screen.getByText('Cloud (AWS)')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Reonboard' })).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Create a Pipeline' }),
    ).toHaveAttribute('href', '/pipelines/create');
  });

  it('shows the empty state when there are no pipelines', async () => {
    getAllPipelines.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByTestId('pipelines-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No pipelines')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create a Pipeline' }),
    ).toHaveAttribute('href', '/pipelines/create');
    expect(screen.queryByText('Create with AI')).not.toBeInTheDocument();
    expect(screen.queryByText('Select Repository')).not.toBeInTheDocument();
  });

  it('links Create a Pipeline to the wizard', async () => {
    getAllPipelines.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByTestId('pipelines-empty-state')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Create a Pipeline' }),
    ).toHaveAttribute('href', '/pipelines/create');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows a Reonboard button without opening a dialog', async () => {
    renderPage();
    const reonboard = await screen.findAllByRole('button', { name: 'Reonboard' });
    fireEvent.click(reonboard[0]);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(createOrUpdatePipeline).not.toHaveBeenCalled();
  });

  it('reports a load failure', async () => {
    getAllPipelines.mockRejectedValueOnce(new Error('unavailable'));
    renderPage();

    await waitFor(() => {
      expect(alertApiPost).toHaveBeenCalledWith({
        message: 'Error loading pipelines',
        severity: 'error',
      });
    });
    expect(await screen.findByTestId('pipelines-empty-state')).toBeInTheDocument();
  });
});
