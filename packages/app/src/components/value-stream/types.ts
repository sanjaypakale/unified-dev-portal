export type ValueStreamMenuItem = {
  displayName: string;
  url?: string;
  isIframeUrl?: boolean;
  children?: ValueStreamMenuItem[];
};

export const IFRAME_NAME = 'iframe_1';

export function hasChildren(item: ValueStreamMenuItem): boolean {
  return Boolean(item.children && item.children.length > 0);
}
