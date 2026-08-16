import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { wrapInTestApp } from '@backstage/test-utils';
import { ValueStreamMenu } from './ValueStreamMenu';
import {
  DOCS_URL,
  KIBANA_LEAD_TIME,
  KIBANA_PROD,
  menuItems,
} from './menuItems.fixture';

describe('ValueStreamMenu', () => {
  const onIframeSelect = jest.fn();

  beforeEach(() => {
    onIframeSelect.mockReset();
    jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderMenu = (activeUrl?: string) =>
    render(
      wrapInTestApp(
        <ValueStreamMenu
          title="Value Stream Dashboard"
          items={menuItems}
          activeUrl={activeUrl}
          onIframeSelect={onIframeSelect}
        />,
      ),
    );

  it('renders the brand title and top-level actions', () => {
    renderMenu();

    expect(
      screen.getByRole('heading', { name: 'Value Stream Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Lead time' }),
    ).toBeInTheDocument();
  });

  it('loads an iframe dashboard from a top-level leaf', () => {
    renderMenu(KIBANA_LEAD_TIME);

    fireEvent.click(screen.getByRole('button', { name: 'Lead time' }));

    expect(onIframeSelect).toHaveBeenCalledWith(KIBANA_LEAD_TIME);
  });

  it('opens an external link in a new tab', () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: /Documentation/ }));

    expect(window.open).toHaveBeenCalledWith(
      DOCS_URL,
      '_blank',
      'noopener,noreferrer',
    );
    expect(onIframeSelect).not.toHaveBeenCalled();
  });

  it('ignores a leaf with no url', () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Empty' }));

    expect(onIframeSelect).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it('opens nested menus and selects an iframe child', async () => {
    renderMenu(KIBANA_PROD);

    fireEvent.click(screen.getByRole('button', { name: 'Delivery' }));
    const nestedParent = await screen.findByText('Change failure rate');
    fireEvent.mouseEnter(nestedParent.closest('[role="menuitem"]') ?? nestedParent);
    fireEvent.click(await screen.findByText('Production'));

    expect(onIframeSelect).toHaveBeenCalledWith(KIBANA_PROD);
  });

  it('opens a nested external link from a submenu', async () => {
    render(
      wrapInTestApp(
        <ValueStreamMenu
          title="Value Stream Dashboard"
          items={[
            {
              displayName: 'Help',
              children: [
                {
                  displayName: 'Guide',
                  url: DOCS_URL,
                  isIframeUrl: false,
                },
                { displayName: 'Missing' },
              ],
            },
          ]}
          onIframeSelect={onIframeSelect}
        />,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    fireEvent.click(await screen.findByText('Guide'));
    fireEvent.click(screen.getByText('Missing'));

    expect(window.open).toHaveBeenCalledWith(
      DOCS_URL,
      '_blank',
      'noopener,noreferrer',
    );
    expect(onIframeSelect).not.toHaveBeenCalled();
  });

  it('closes a nested flyout after the leave delay', async () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Delivery' }));
    const parent = (await screen.findByText('Change failure rate')).closest(
      '[role="menuitem"]',
    ) as HTMLElement;
    fireEvent.mouseEnter(parent);
    expect(await screen.findByText('Production')).toBeInTheDocument();

    fireEvent.mouseLeave(parent);
    await waitFor(() => {
      expect(screen.queryByText('Production')).not.toBeInTheDocument();
    });
  });

  it('cancels close when the pointer returns to the nested panel', async () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Delivery' }));
    const parent = (await screen.findByText('Change failure rate')).closest(
      '[role="menuitem"]',
    ) as HTMLElement;
    fireEvent.mouseEnter(parent);
    const production = await screen.findByText('Production');
    const paper =
      production.closest('.MuiPaper-root') ??
      production.closest('[role="menu"]');

    fireEvent.mouseLeave(parent);
    if (paper) {
      fireEvent.mouseEnter(paper);
      fireEvent.mouseLeave(paper);
    }

    await waitFor(() => {
      expect(screen.queryByText('Production')).not.toBeInTheDocument();
    });
  });

  it('closes the top-level menu with escape', async () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Delivery' }));
    expect(await screen.findByText('Change failure rate')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('presentation'), { key: 'Escape' });

    await waitFor(() => {
      expect(
        screen.queryByText('Change failure rate'),
      ).not.toBeInTheDocument();
    });
  });
});
