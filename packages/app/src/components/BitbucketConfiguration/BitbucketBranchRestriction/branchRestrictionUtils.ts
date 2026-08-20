export type BranchRestrictionPermission = {
  id: string | number;
  type: string;
  matcher?: {
    id?: string;
    displayId?: string;
  };
  scope?: {
    type?: string;
  };
  users?: Array<{
    name: string;
    displayName: string;
    active?: boolean;
  }>;
  groups?: string[];
};

export function groupByMatcher(
  permissions: BranchRestrictionPermission[],
): Record<string, BranchRestrictionPermission[]> {
  const grouped: Record<string, BranchRestrictionPermission[]> = {};

  permissions.forEach(permission => {
    const matcher = permission.matcher?.id ?? 'unknown';

    if (!grouped[matcher]) {
      grouped[matcher] = [];
    }

    grouped[matcher].push(permission);
  });

  return grouped;
}

export function getPreventLabel(type: string): string {
  switch (type) {
    case 'read-only':
      return 'All Changes';
    case 'pull-request-only':
      return 'Changes without a pull request';
    case 'no-deletes':
      return 'Deletion';
    case 'fast-forward-only':
      return 'Rewriting history';
    default:
      return type;
  }
}
