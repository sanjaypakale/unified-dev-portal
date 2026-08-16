import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { wrapInTestApp } from '@backstage/test-utils';
import { ValueStreamDashboard } from './ValueStreamDashboard';
import { fetchDashboardMenu } from './fetchDashboardMenu';
import { KIBANA_LEAD_TIME, menuItems } from './menuItems.fixture';

jest.mock('./fetchDashboardMenu', () => ({
  fetchDashboardMenu: jest.fn(),
}));

const fetchMenu = fetchDashboardMenu as jest.MockedFunction<
  typeof fetchDashboardMenu
>;

describe('ValueStreamDashboard', () => {
  beforeEach(() => {
    fetchMenu.mockReset();
  });

  it('shows a placeholder after the menu loads', async () => {
    fetchMenu.mockResolvedValue(menuItems);

    render(wrapInTestApp(<ValueStreamDashboard />));

    expect(
      await screen.findByRole('heading', { name: 'Value Stream Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Select a dashboard')).toBeInTheDocument();
  });

  it('loads a selected Kibana dashboard in an iframe', async () => {
    fetchMenu.mockResolvedValue(menuItems);

    render(wrapInTestApp(<ValueStreamDashboard />));
    fireEvent.click(await screen.findByRole('button', { name: 'Lead time' }));

    const frame = await screen.findByTitle('ELK dashboard');
    expect(frame).toHaveAttribute('src', KIBANA_LEAD_TIME);
    expect(frame).toHaveAttribute('name', 'iframe_1');
    expect(screen.queryByText('Select a dashboard')).not.toBeInTheDocument();
  });

  it('shows an API error message', async () => {
    fetchMenu.mockRejectedValue(new Error('Menu API returned 503'));

    render(wrapInTestApp(<ValueStreamDashboard />));

    expect(await screen.findByText('Menu API returned 503')).toBeInTheDocument();
    expect(screen.queryByText('Select a dashboard')).not.toBeInTheDocument();
  });

  it('shows a fallback message for unknown failures', async () => {
    fetchMenu.mockRejectedValue('boom');

    render(wrapInTestApp(<ValueStreamDashboard />));

    expect(
      await screen.findByText('Failed to load dashboard menu'),
    ).toBeInTheDocument();
  });

  it('does not update state after unmount', async () => {
    let resolveMenu: (value: typeof menuItems) => void = () => undefined;
    fetchMenu.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveMenu = resolve;
        }),
    );

    const view = render(wrapInTestApp(<ValueStreamDashboard />));
    view.unmount();
    resolveMenu(menuItems);

    await waitFor(() => {
      expect(fetchMenu).toHaveBeenCalled();
    });
  });
});
