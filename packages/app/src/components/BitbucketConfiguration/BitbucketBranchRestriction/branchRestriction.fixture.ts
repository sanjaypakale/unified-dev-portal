import { BranchRestrictionPermission } from './branchRestrictionUtils';

export const PROJECT_KEY = 'PROJ';
export const REPO_NAME = 'demo-repo';

export const samplePermissions: BranchRestrictionPermission[] = [
  {
    id: 1,
    type: 'read-only',
    matcher: { id: 'refs/heads/main', displayId: 'main' },
    scope: { type: 'BRANCH' },
    users: [
      { name: 'jdoe', displayName: 'John Doe', active: true },
      { name: 'asmith', displayName: 'Alice Smith', active: false },
    ],
    groups: ['developers', 'admins'],
  },
  {
    id: 2,
    type: 'pull-request-only',
    matcher: { id: 'refs/heads/main', displayId: 'main' },
    scope: { type: 'BRANCH' },
    users: [],
    groups: [],
  },
  {
    id: 3,
    type: 'no-deletes',
    matcher: { id: 'refs/heads/develop', displayId: 'develop' },
    scope: { type: 'PATTERN' },
    users: [{ name: 'bot', displayName: 'Build Bot', active: true }],
  },
  {
    id: 4,
    type: 'fast-forward-only',
    matcher: { id: 'refs/heads/release', displayId: 'release' },
    scope: { type: 'BRANCH' },
  },
  {
    id: 5,
    type: 'custom-restriction',
    matcher: { id: 'refs/heads/hotfix', displayId: 'hotfix' },
    scope: { type: 'BRANCH' },
  },
];

export const branchPermissionsResponse = {
  branchPermissions: {
    values: samplePermissions,
  },
};
