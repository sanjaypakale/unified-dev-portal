import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import { ddpApiRef, DdpApi } from '../../../api/DdpApi';
import { BitbucketBranchRestriction } from './BitbucketBranchRestriction';
import {
  PROJECT_KEY,
  REPO_NAME,
  branchPermissionsResponse,
} from './branchRestriction.fixture';

describe('BitbucketBranchRestriction', () => {
  const getBitbucketRepoPermission = jest.fn();
  const ddpApi: DdpApi = { getBitbucketRepoPermission };

  beforeEach(() => {
    getBitbucketRepoPermission.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = (props?: {
    projectKey?: string;
    repoName?: string;
  }) =>
    render(
      wrapInTestApp(
        <TestApiProvider apis={[[ddpApiRef, ddpApi]]}>
          <BitbucketBranchRestriction
            projectKey={props?.projectKey ?? PROJECT_KEY}
            repoName={props?.repoName ?? REPO_NAME}
          />
        </TestApiProvider>,
      ),
    );

  it('does not fetch when projectKey is empty', async () => {
    renderComponent({ projectKey: '' });

    expect(getBitbucketRepoPermission).not.toHaveBeenCalled();
    expect(screen.getByText('Branch')).toBeInTheDocument();
    expect(screen.queryByText('main')).not.toBeInTheDocument();
  });

  it('shows a loading indicator while fetching', async () => {
    getBitbucketRepoPermission.mockImplementation(
      () => new Promise(() => undefined),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('fetches branch permissions and renders the table', async () => {
    getBitbucketRepoPermission.mockResolvedValue(branchPermissionsResponse);

    renderComponent();

    await waitFor(() => {
      expect(getBitbucketRepoPermission).toHaveBeenCalledWith(
        PROJECT_KEY,
        REPO_NAME,
        'branchpermission',
      );
    });

    expect(await screen.findByText('main')).toBeInTheDocument();
    expect(screen.getByText('develop')).toBeInTheDocument();
    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(screen.getByText('Prevent')).toBeInTheDocument();
    expect(screen.getByText('Exemptions')).toBeInTheDocument();
  });

  it('renders prevent labels for all known restriction types', async () => {
    getBitbucketRepoPermission.mockResolvedValue(branchPermissionsResponse);

    renderComponent();

    expect(await screen.findByText('All Changes')).toBeInTheDocument();
    expect(
      screen.getByText('Changes without a pull request'),
    ).toBeInTheDocument();
    expect(screen.getByText('Deletion')).toBeInTheDocument();
    expect(screen.getByText('Rewriting history')).toBeInTheDocument();
    expect(screen.getByText('custom-restriction')).toBeInTheDocument();
  });

  it('renders active and inactive users with groups', async () => {
    getBitbucketRepoPermission.mockResolvedValue(branchPermissionsResponse);

    renderComponent();

    expect(
      await screen.findByText('John Doe (jdoe)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Alice Smith (asmith)')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith (asmith)')).toHaveStyle({
      color: 'rgb(128, 128, 128)',
    });
    expect(screen.getByText('developers')).toBeInTheDocument();
    expect(screen.getByText('admins')).toBeInTheDocument();
    expect(screen.getByText('Build Bot (bot)')).toBeInTheDocument();
  });

  it('row-spans the branch cell for grouped matcher entries', async () => {
    getBitbucketRepoPermission.mockResolvedValue(branchPermissionsResponse);

    renderComponent();

    const branchCell = await screen.findByText('main');
    expect(branchCell.closest('td')).toHaveAttribute('rowspan', '2');
  });

  it('handles an empty permissions payload', async () => {
    getBitbucketRepoPermission.mockResolvedValue({
      branchPermissions: { values: [] },
    });

    renderComponent();

    await waitFor(() => {
      expect(getBitbucketRepoPermission).toHaveBeenCalled();
    });

    expect(screen.getByText('Branch')).toBeInTheDocument();
    expect(screen.queryByText('main')).not.toBeInTheDocument();
  });

  it('handles a missing branchPermissions values field', async () => {
    getBitbucketRepoPermission.mockResolvedValue({});

    renderComponent();

    await waitFor(() => {
      expect(getBitbucketRepoPermission).toHaveBeenCalled();
    });

    expect(screen.getByText('Branch')).toBeInTheDocument();
  });

  it('logs and recovers when the API call fails', async () => {
    const error = new Error('network down');
    getBitbucketRepoPermission.mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching branch restrictions',
        error,
      );
    });

    expect(screen.getByText('Branch')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('refetches when repoName changes', async () => {
    getBitbucketRepoPermission.mockResolvedValue(branchPermissionsResponse);

    const view = renderComponent();

    await waitFor(() => {
      expect(getBitbucketRepoPermission).toHaveBeenCalledTimes(1);
    });

    view.rerender(
      wrapInTestApp(
        <TestApiProvider apis={[[ddpApiRef, ddpApi]]}>
          <BitbucketBranchRestriction
            projectKey={PROJECT_KEY}
            repoName="other-repo"
          />
        </TestApiProvider>,
      ),
    );

    await waitFor(() => {
      expect(getBitbucketRepoPermission).toHaveBeenCalledWith(
        PROJECT_KEY,
        'other-repo',
        'branchpermission',
      );
    });
  });

  it('ignores late responses after unmount', async () => {
    let resolveRequest: (value: typeof branchPermissionsResponse) => void =
      () => undefined;
    getBitbucketRepoPermission.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveRequest = resolve;
        }),
    );

    const view = renderComponent();
    await waitFor(() => {
      expect(getBitbucketRepoPermission).toHaveBeenCalled();
    });

    view.unmount();
    resolveRequest(branchPermissionsResponse);

    await waitFor(() => {
      expect(getBitbucketRepoPermission).toHaveBeenCalledTimes(1);
    });
  });
});
