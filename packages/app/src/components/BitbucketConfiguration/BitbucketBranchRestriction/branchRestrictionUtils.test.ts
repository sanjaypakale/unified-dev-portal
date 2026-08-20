import { groupByMatcher, getPreventLabel } from './branchRestrictionUtils';
import { samplePermissions } from './branchRestriction.fixture';

describe('branchRestrictionUtils', () => {
  describe('getPreventLabel', () => {
    it.each([
      ['read-only', 'All Changes'],
      ['pull-request-only', 'Changes without a pull request'],
      ['no-deletes', 'Deletion'],
      ['fast-forward-only', 'Rewriting history'],
      ['unknown-type', 'unknown-type'],
    ])('maps %s to %s', (type, label) => {
      expect(getPreventLabel(type)).toBe(label);
    });
  });

  describe('groupByMatcher', () => {
    it('groups permissions by matcher id', () => {
      const grouped = groupByMatcher(samplePermissions);

      expect(Object.keys(grouped)).toEqual([
        'refs/heads/main',
        'refs/heads/develop',
        'refs/heads/release',
        'refs/heads/hotfix',
      ]);
      expect(grouped['refs/heads/main']).toHaveLength(2);
      expect(grouped['refs/heads/develop']).toHaveLength(1);
    });

    it('uses unknown when matcher id is missing', () => {
      const grouped = groupByMatcher([
        {
          id: 99,
          type: 'read-only',
          scope: { type: 'BRANCH' },
        },
      ]);

      expect(grouped.unknown).toHaveLength(1);
    });

    it('returns an empty object for an empty list', () => {
      expect(groupByMatcher([])).toEqual({});
    });
  });
});
