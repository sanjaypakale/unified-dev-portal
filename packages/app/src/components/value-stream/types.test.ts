import { hasChildren } from './types';

describe('hasChildren', () => {
  it('is false when children are missing or empty', () => {
    expect(hasChildren({ displayName: 'Leaf' })).toBe(false);
    expect(hasChildren({ displayName: 'Leaf', children: [] })).toBe(false);
  });

  it('is true when nested items exist', () => {
    expect(
      hasChildren({
        displayName: 'Parent',
        children: [{ displayName: 'Child' }],
      }),
    ).toBe(true);
  });
});
