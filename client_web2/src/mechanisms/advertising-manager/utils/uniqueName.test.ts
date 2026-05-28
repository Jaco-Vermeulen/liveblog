import { describe, expect, it } from 'vitest';
import { uniqueNameInItems } from './uniqueName';

describe('uniqueNameInItems', () => {
  it('allows same name when editing same item', () => {
    expect(uniqueNameInItems('a', [{ _id: '1', name: 'a' }], '1')).toBe(true);
  });

  it('rejects duplicate for new item', () => {
    expect(uniqueNameInItems('a', [{ _id: '1', name: 'a' }])).toBe(false);
  });
});
