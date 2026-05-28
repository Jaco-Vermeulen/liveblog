import { describe, expect, it } from 'vitest';
import type { Theme } from '@/mechanisms/liveblog-api';
import { getHierarchyFromThemes } from './themeHierarchy';

describe('themeHierarchy', () => {
  it('nests child themes under parent extends', () => {
    const themes: Theme[] = [
      { _id: '1', name: 'default' },
      { _id: '2', name: 'child', extends: 'default' },
    ];
    const tree = getHierarchyFromThemes(themes);
    expect(tree.default).toBeDefined();
    expect((tree.default as Record<string, unknown>).child).toEqual({});
  });
});
