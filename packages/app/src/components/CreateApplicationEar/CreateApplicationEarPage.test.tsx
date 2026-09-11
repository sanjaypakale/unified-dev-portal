import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { ddpApiRef, DdpApi } from '../../api/DdpApi';
import { CreateApplicationEarPage } from './CreateApplicationEarPage';

/** Dialog TextField order in CreateApplicationEarPage. */
const IDX = {
  appCode: 0,
  uniqueAppCode: 1,
  appName: 2,
  l2Code: 3,
  appLead: 4,
  appLeadLanId: 5,
  l2Head: 6,
  sonar: 7,
  jenkins: 8,
  artifactory: 9,
  veracode: 10,
  bitbucket: 11,
  dast: 12,
} as const;

const SAMPLE_APPS = [
  {
    appCode: 'PAY',
    uniqueAppCode: 'PAY-001',
    appName: 'Payments Service',
    domain: 'Finance',
    l2Code: 'L2-FIN',
    l3Name: 'Payments',
    l3Code: 'L3-PAY',
    appLead: 'Jane Doe',
    appLeadLanId: 'jdoe',
    l2Head: 'John Smith',
    sonarInstance: 'sonar',
    jenkinsInstance: 'jenkins',
    artifactoryInstance: 'artifactory',
    veracodeInstance: 'veracode',
    bitbucketInstance: 'bitbucket',
    dastInstance: 'dast',
    isActive: true,
  },
  { appCode: 'CAT', appName: 'Catalog Gateway', isActive: false },
  { appCode: 'IDP', appName: 'Identity Portal', isActive: '1' },
];

/** UI-heavy dialog flows need headroom on slow Jenkins agents (default Jest timeout is 5s). */
const UI_TEST_TIMEOUT_MS = 20000;

describe('CreateApplicationEarPage', () => {
  const getAllEarApps = jest.fn();
  const createOrUpdateEarApplication = jest.fn();
  const ddpApi = {
    getBitbucketRepoPermission: jest.fn(),
    getAllEarApps,
    createOrUpdateEarApplication,
  } as unknown as DdpApi;

  const renderPage = () =>
    render(
      wrapInTestApp(
        <TestApiProvider apis={[[ddpApiRef, ddpApi]]}>
          <CreateApplicationEarPage />
        </TestApiProvider>,
      ),
    );

  const getDialog = () => screen.getByRole('dialog');

  const setFields = (updates: Array<[number, string]>) => {
    const inputs = within(getDialog()).getAllByRole('textbox');
    updates.forEach(([index, value]) => {
      fireEvent.change(inputs[index], { target: { value } });
    });
  };

  const fillRequired = () => {
    setFields([
      [IDX.appCode, 'NEW'],
      [IDX.uniqueAppCode, 'NEW-001'],
      [IDX.appName, 'New App'],
      [IDX.l2Code, 'L2-NEW'],
      [IDX.appLead, 'Lead'],
      [IDX.appLeadLanId, 'lead1'],
      [IDX.l2Head, 'Head'],
    ]);
  };

  const openCreateDialog = async () => {
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Create Application EAR' })[0],
    );
    expect(
      await screen.findByRole('heading', { name: 'Create New Application EAR' }),
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
    getAllEarApps.mockReset();
    createOrUpdateEarApplication.mockReset();
    getAllEarApps.mockResolvedValue(SAMPLE_APPS);
    createOrUpdateEarApplication.mockResolvedValue({});
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('loads apps and shows active flags', async () => {
    renderPage();
    expect(await screen.findByText('Payments Service')).toBeInTheDocument();
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0);
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it(
    'creates an inactive app with empty optional fields',
    async () => {
      renderPage();
      await openCreateDialog();
      fillRequired();
      fireEvent.click(within(getDialog()).getByLabelText('Active'));
      await submitDialog(/^Create$/);

      await waitFor(() => {
        expect(createOrUpdateEarApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            appCode: 'NEW',
            uniqueAppCode: 'NEW-001',
            id: '',
            isActive: '0',
            sonarInstance: undefined,
            jenkinsInstance: undefined,
            artifactoryInstance: undefined,
            veracodeInstance: undefined,
            bitbucketInstance: undefined,
            dastInstance: undefined,
          }),
        );
      });
    },
    UI_TEST_TIMEOUT_MS,
  );

  it(
    'edits an app and updates instance fields',
    async () => {
      renderPage();
      await clickEditAt(0);
      expect(
        await screen.findByRole('heading', { name: 'Update Application EAR' }),
      ).toBeInTheDocument();
      expect(screen.getByText('App Code cannot be changed')).toBeInTheDocument();

      setFields([
        [IDX.sonar, 's2'],
        [IDX.jenkins, 'j2'],
        [IDX.artifactory, 'a2'],
        [IDX.veracode, 'v2'],
        [IDX.bitbucket, 'b2'],
        [IDX.dast, 'd2'],
      ]);
      await submitDialog(/^Update$/);

      await waitFor(() => {
        expect(createOrUpdateEarApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            jenkinsInstance: 'j2',
            sonarInstance: 's2',
            artifactoryInstance: 'a2',
            veracodeInstance: 'v2',
            bitbucketInstance: 'b2',
            dastInstance: 'd2',
            isActive: '1',
          }),
        );
      });
    },
    UI_TEST_TIMEOUT_MS,
  );

  it('cancels edit for an inactive row', async () => {
    renderPage();
    await clickEditAt(1);
    expect(
      await screen.findByRole('heading', { name: 'Update Application EAR' }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(getDialog()).getByRole('button', { name: /^Cancel$/ }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Update Application EAR' }),
      ).not.toBeInTheDocument();
    });
  });

  it('opens edit for a string-active row then cancels', async () => {
    renderPage();
    await clickEditAt(2);
    expect(
      await screen.findByRole('heading', { name: 'Update Application EAR' }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(getDialog()).getByRole('button', { name: /^Cancel$/ }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Update Application EAR' }),
      ).not.toBeInTheDocument();
    });
  });

  it('handles a null apps payload', async () => {
    getAllEarApps.mockResolvedValueOnce(null as unknown as any[]);
    renderPage();
    await waitFor(() => expect(getAllEarApps).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Existing EAR Applications')).toBeInTheDocument();
    expect(screen.queryByText('Payments Service')).not.toBeInTheDocument();
  });

  it('handles load failure', async () => {
    getAllEarApps.mockRejectedValueOnce(new Error('load failed'));
    renderPage();
    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith(
        'Error loading existing EAR apps:',
        expect.any(Error),
      );
    });
    expect(screen.getByText('Existing EAR Applications')).toBeInTheDocument();
  });

  it(
    'handles save failure',
    async () => {
      createOrUpdateEarApplication.mockRejectedValueOnce(
        new Error('save failed'),
      );
      renderPage();
      await openCreateDialog();
      fillRequired();
      await submitDialog(/^Create$/);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Error saving EAR application',
        );
      });
    },
    UI_TEST_TIMEOUT_MS,
  );

  it('shows progress while apps are loading', async () => {
    getAllEarApps.mockImplementation(() => new Promise(() => undefined));
    renderPage();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });
});
