import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import {
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

  const setField = (index: number, value: string) => {
    fireEvent.change(within(getDialog()).getAllByRole('textbox')[index], {
      target: { value },
    });
  };

  const fillRequired = () => {
    setField(IDX.appCode, 'NEW');
    setField(IDX.uniqueAppCode, 'NEW-001');
    setField(IDX.appName, 'New App');
    setField(IDX.l2Code, 'L2-NEW');
    setField(IDX.appLead, 'Lead');
    setField(IDX.appLeadLanId, 'lead1');
    setField(IDX.l2Head, 'Head');
  };

  const openCreateDialog = async () => {
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Create Application EAR' })[0],
    );
    expect(
      await screen.findByRole('heading', { name: 'Create New Application EAR' }),
    ).toBeInTheDocument();
  };

  const clickDialogButton = (name: RegExp) => {
    fireEvent.click(within(getDialog()).getByRole('button', { name }));
  };

  beforeEach(() => {
    getAllEarApps.mockReset();
    createOrUpdateEarApplication.mockReset();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads apps, creates, edits, cancels, and saves covering field branches', async () => {
    getAllEarApps.mockResolvedValue(SAMPLE_APPS);
    createOrUpdateEarApplication.mockResolvedValue({});

    renderPage();

    expect(await screen.findByText('Payments Service')).toBeInTheDocument();
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0);
    expect(screen.getByText('No')).toBeInTheDocument();

    await openCreateDialog();
    fillRequired();
    fireEvent.click(within(getDialog()).getByLabelText('Active'));
    clickDialogButton(/^Create$/);

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

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    fireEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[0]);
    expect(
      await screen.findByRole('heading', { name: 'Update Application EAR' }),
    ).toBeInTheDocument();
    expect(screen.getByText('App Code cannot be changed')).toBeInTheDocument();

    setField(IDX.jenkins, 'j2');
    setField(IDX.sonar, 's2');
    setField(IDX.artifactory, 'a2');
    setField(IDX.veracode, 'v2');
    setField(IDX.bitbucket, 'b2');
    setField(IDX.dast, 'd2');
    clickDialogButton(/^Update$/);

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

    fireEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[1]);
    await screen.findByRole('heading', { name: 'Update Application EAR' });
    clickDialogButton(/^Cancel$/);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    fireEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[2]);
    await screen.findByRole('heading', { name: 'Update Application EAR' });
    clickDialogButton(/^Cancel$/);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  }, 15000);

  it('handles empty payload, load failure, and save failure', async () => {
    getAllEarApps.mockResolvedValueOnce(null as unknown as any[]);
    const first = renderPage();
    await waitFor(() => expect(getAllEarApps).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Existing EAR Applications')).toBeInTheDocument();
    first.unmount();

    getAllEarApps.mockRejectedValueOnce(new Error('load failed'));
    const second = renderPage();
    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith(
        'Error loading existing EAR apps:',
        expect.any(Error),
      );
    });
    second.unmount();

    getAllEarApps.mockResolvedValue(SAMPLE_APPS);
    createOrUpdateEarApplication.mockRejectedValue(new Error('save failed'));
    renderPage();
    expect(await screen.findByText('Payments Service')).toBeInTheDocument();
    await openCreateDialog();
    fillRequired();
    clickDialogButton(/^Create$/);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error saving EAR application',
        expect.any(Error),
      );
    });
  }, 15000);

  it('shows progress while apps are loading', async () => {
    getAllEarApps.mockImplementation(() => new Promise(() => undefined));
    renderPage();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });
});
