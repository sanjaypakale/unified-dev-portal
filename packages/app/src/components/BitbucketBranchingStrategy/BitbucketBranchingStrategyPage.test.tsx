import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { alertApiRef, AlertApi } from '@backstage/core-plugin-api';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { ddpApiRef, DdpApi } from '../../api/DdpApi';
import { BitbucketBranchingStrategyPage } from './BitbucketBranchingStrategyPage';

const SAMPLE_RECORDS = [
  {
    id: 1,
    branchingEnabled: true,
    domainName: 'Payments',
    uniqueAppCode: 'PAY-001',
    bitbucketProjectKey: 'PAY',
    repositoryName: 'payments-service',
    as400: false,
    branchNamingRegex: '^(feature|bugfix)/.+$',
    enforcementDate: '2026-01-15',
    minimumGate: 80,
    currentBranchingScore: 92,
    currentBranchingGate: 80,
    branchingStrategySopLink: 'https://wiki.example.com/branching/pay',
  },
  {
    id: 2,
    uniqueAppCode: 'CAT-003',
    bitbucketProjectKey: 'CAT',
    repositoryName: 'catalog-gateway',
    as400: true,
    enforcementDate: '2026-03-01',
    minimumGate: 60,
  },
  {
    id: 3,
    uniqueAppCode: 'IDP-002',
    bitbucketProjectKey: 'IDP',
    repositoryName: 'identity-portal',
    as400: '1',
    enforcementDate: '2026-02-01',
    minimumGate: 70,
  },
];

/** UI-heavy dialog flows need headroom on slow Jenkins agents (default Jest timeout is 5s). */
const UI_TEST_TIMEOUT_MS = 20000;

describe('BitbucketBranchingStrategyPage', () => {
  const getAllBitbucketBranchingMetadata = jest.fn();
  const createOrUpdateBitbucketBranchingMetadata = jest.fn();
  const alertApiPost = jest.fn();
  const ddpApi = {
    getBitbucketRepoPermission: jest.fn(),
    getAllEarApps: jest.fn(),
    createOrUpdateEarApplication: jest.fn(),
    getAllBitbucketBranchingMetadata,
    createOrUpdateBitbucketBranchingMetadata,
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
          <BitbucketBranchingStrategyPage />
        </TestApiProvider>,
      ),
    );

  const getDialog = () => screen.getByRole('dialog');

  const setField = (label: string | RegExp, value: string) => {
    fireEvent.change(within(getDialog()).getByLabelText(label), {
      target: { value },
    });
  };

  const fillRequired = () => {
    setField(/Unique App Code/, 'NEW-001');
    setField(/Bitbucket Project Key/, 'NEW');
    setField(/Bitbucket Repository Name/, 'new-service');
  };

  const openCreateDialog = async () => {
    fireEvent.click(
      screen.getByRole('button', { name: 'Add Branching Strategy' }),
    );
    expect(
      await screen.findByRole('heading', {
        name: 'Create Bitbucket Branching Strategy',
      }),
    ).toBeInTheDocument();
  };

  /**
   * MUI ignores clicks on disabled buttons. On slow CI, React may not have
   * re-rendered with isFormValid=true yet — wait before clicking.
   */
  const submitDialog = async (name: RegExp) => {
    await waitFor(() => {
      expect(
        within(getDialog()).getByRole('button', { name }),
      ).not.toBeDisabled();
    });
    fireEvent.click(within(getDialog()).getByRole('button', { name }));
  };

  const clickEditAt = async (index: number) => {
    const edits = await screen.findAllByText(/^Edit$/);
    fireEvent.click(edits[index]);
  };

  beforeEach(() => {
    getAllBitbucketBranchingMetadata.mockReset();
    createOrUpdateBitbucketBranchingMetadata.mockReset();
    alertApiPost.mockReset();
    getAllBitbucketBranchingMetadata.mockResolvedValue(SAMPLE_RECORDS);
    createOrUpdateBitbucketBranchingMetadata.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('loads records and shows AS400 flags', async () => {
    renderPage();
    expect(await screen.findByText('PAY-001')).toBeInTheDocument();
    expect(screen.getByText('payments-service')).toBeInTheDocument();
    expect(screen.getByText('2026-01-15')).toBeInTheDocument();
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0);
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it(
    'creates a record with empty optional fields',
    async () => {
      renderPage();
      await openCreateDialog();
      fillRequired();
      await submitDialog(/^Create$/);

      await waitFor(() => {
        expect(createOrUpdateBitbucketBranchingMetadata).toHaveBeenCalledWith(
          expect.objectContaining({
            uniqueAppCode: 'NEW-001',
            bitbucketProjectKey: 'NEW',
            repositoryName: 'new-service',
            id: undefined,
            branchingEnabled: false,
            as400: false,
            domainName: undefined,
            branchNamingRegex: undefined,
            enforcementDate: undefined,
            minimumGate: undefined,
            currentBranchingScore: undefined,
            currentBranchingGate: undefined,
            branchingStrategySopLink: undefined,
          }),
        );
      });
    },
    UI_TEST_TIMEOUT_MS,
  );

  it(
    'edits a record and updates DTO fields',
    async () => {
      renderPage();
      await clickEditAt(0);
      expect(
        await screen.findByRole('heading', {
          name: 'Update Bitbucket Branching Strategy',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Unique App Code cannot be changed'),
      ).toBeInTheDocument();

      setField(/Bitbucket Project Key/, 'PAY2');
      setField(/Minimum Gate/, '90');
      setField(/Enforcement Date/, '2026-06-01');
      fireEvent.click(within(getDialog()).getByLabelText('AS400 Project'));
      await submitDialog(/^Update$/);

      await waitFor(() => {
        expect(createOrUpdateBitbucketBranchingMetadata).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            uniqueAppCode: 'PAY-001',
            bitbucketProjectKey: 'PAY2',
            repositoryName: 'payments-service',
            minimumGate: 90,
            enforcementDate: '2026-06-01',
            as400: true,
            branchingEnabled: true,
          }),
        );
      });
    },
    UI_TEST_TIMEOUT_MS,
  );

  it('cancels edit for an AS400 row', async () => {
    renderPage();
    await clickEditAt(1);
    expect(
      await screen.findByRole('heading', {
        name: 'Update Bitbucket Branching Strategy',
      }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(getDialog()).getByRole('button', { name: /^Cancel$/ }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: 'Update Bitbucket Branching Strategy',
        }),
      ).not.toBeInTheDocument();
    });
  });

  it('opens edit for a string-AS400 row then cancels', async () => {
    renderPage();
    await clickEditAt(2);
    expect(
      await screen.findByRole('heading', {
        name: 'Update Bitbucket Branching Strategy',
      }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(getDialog()).getByRole('button', { name: /^Cancel$/ }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: 'Update Bitbucket Branching Strategy',
        }),
      ).not.toBeInTheDocument();
    });
  });

  it('handles a null records payload', async () => {
    getAllBitbucketBranchingMetadata.mockResolvedValueOnce(
      null as unknown as any[],
    );
    renderPage();
    await waitFor(() =>
      expect(getAllBitbucketBranchingMetadata).toHaveBeenCalledTimes(1),
    );
    expect(
      screen.getByText('Existing Branching Strategies'),
    ).toBeInTheDocument();
    expect(screen.queryByText('PAY-001')).not.toBeInTheDocument();
  });

  it('handles load failure', async () => {
    getAllBitbucketBranchingMetadata.mockRejectedValueOnce(
      new Error('load failed'),
    );
    renderPage();
    await waitFor(() => {
      expect(alertApiPost).toHaveBeenCalledWith({
        message: 'Error loading Bitbucket branching metadata',
        severity: 'warning',
      });
    });
    expect(
      screen.getByText('Existing Branching Strategies'),
    ).toBeInTheDocument();
  });

  it(
    'handles save failure',
    async () => {
      createOrUpdateBitbucketBranchingMetadata.mockRejectedValueOnce(
        new Error('save failed'),
      );
      renderPage();
      await openCreateDialog();
      fillRequired();
      await submitDialog(/^Create$/);

      await waitFor(() => {
        expect(alertApiPost).toHaveBeenCalledWith({
          message: 'Error saving Bitbucket branching metadata',
          severity: 'error',
        });
      });
    },
    UI_TEST_TIMEOUT_MS,
  );

  it('shows progress while records are loading', async () => {
    getAllBitbucketBranchingMetadata.mockImplementation(
      () => new Promise(() => undefined),
    );
    renderPage();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });
});
