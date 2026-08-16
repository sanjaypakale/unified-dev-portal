import { ValueStreamMenuItem } from './types';

export const DASHBOARD_MENU_URL =
  'https://developerportalp.sg.uobnet.com/getdashboardmenu?refreshCache=false';

export async function fetchDashboardMenu(): Promise<ValueStreamMenuItem[]> {
  const response = await fetch(DASHBOARD_MENU_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Menu API returned ${response.status}`);
  }

  return normalizeMenuData(await response.json());
}

function normalizeMenuData(data: unknown): ValueStreamMenuItem[] {
  const items = extractItems(data);
  return items.map(normalizeItem);
}

function extractItems(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of [
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
    ]) {
      if (Array.isArray(record[key])) {
        return record[key] as unknown[];
      }
    }
  }
  return [];
}

function normalizeItem(raw: unknown): ValueStreamMenuItem {
  const item = (raw ?? {}) as Record<string, unknown>;
  const children = item.children ?? item.Children;

  return {
    displayName: String(
      item.displayName ?? item.DisplayName ?? item.name ?? item.Name ?? '',
    ),
    url: optionalString(item.url ?? item.Url),
    isIframeUrl: Boolean(item.isIframeUrl ?? item.IsIframeUrl),
    children: Array.isArray(children)
      ? children.map(normalizeItem)
      : undefined,
  };
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
