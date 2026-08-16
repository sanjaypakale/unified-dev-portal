import {
  DASHBOARD_MENU_URL,
  fetchDashboardMenu,
} from './fetchDashboardMenu';

function mockJsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('fetchDashboardMenu', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('requests the dashboard menu with GET', async () => {
    fetchMock.mockResolvedValue(mockJsonResponse(200, []));

    await fetchDashboardMenu();

    expect(fetchMock).toHaveBeenCalledWith(DASHBOARD_MENU_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  });

  it('throws when the menu API is not successful', async () => {
    fetchMock.mockResolvedValue(mockJsonResponse(500, {}));

    await expect(fetchDashboardMenu()).rejects.toThrow('Menu API returned 500');
  });

  it('maps a top-level array of camelCase items', async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(200, [
        {
          displayName: 'Lead time',
          url: 'https://kibana/lead',
          isIframeUrl: true,
        },
      ]),
    );

    await expect(fetchDashboardMenu()).resolves.toEqual([
      {
        displayName: 'Lead time',
        url: 'https://kibana/lead',
        isIframeUrl: true,
        children: undefined,
      },
    ]);
  });

  it.each([
    'items',
    'Items',
    'data',
    'Data',
    'menu',
    'Menu',
    'children',
    'Children',
    'dashboardMenu',
    'DashboardMenu',
  ])('unwraps menu items from %s', async key => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(200, { [key]: [{ displayName: 'Reports' }] }),
    );

    const [first] = await fetchDashboardMenu();
    expect(first.displayName).toBe('Reports');
  });

  it('returns an empty list for unknown payloads', async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse(200, null));
    await expect(fetchDashboardMenu()).resolves.toEqual([]);

    fetchMock.mockResolvedValueOnce(mockJsonResponse(200, 'nope'));
    await expect(fetchDashboardMenu()).resolves.toEqual([]);

    fetchMock.mockResolvedValueOnce(mockJsonResponse(200, { extra: true }));
    await expect(fetchDashboardMenu()).resolves.toEqual([]);
  });

  it('normalizes PascalCase fields, nested children, and empty urls', async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(200, [
        null,
        {
          DisplayName: 'Parent',
          Children: [
            { name: 'Docs', Url: 'https://docs', IsIframeUrl: false },
            { Name: 'Blank', Url: '' },
          ],
        },
      ]),
    );

    await expect(fetchDashboardMenu()).resolves.toEqual([
      {
        displayName: '',
        url: undefined,
        isIframeUrl: false,
        children: undefined,
      },
      {
        displayName: 'Parent',
        url: undefined,
        isIframeUrl: false,
        children: [
          {
            displayName: 'Docs',
            url: 'https://docs',
            isIframeUrl: false,
            children: undefined,
          },
          {
            displayName: 'Blank',
            url: undefined,
            isIframeUrl: false,
            children: undefined,
          },
        ],
      },
    ]);
  });
});
