import { describe, expect, it } from 'vitest';
import { reorderArray } from './reorderArray';

describe('reorderArray', () => {
  it('moves an item up in the list', () => {
    expect(reorderArray(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('moves an item down in the list', () => {
    expect(reorderArray(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('returns a copy when indices are equal', () => {
    const input = ['a', 'b'];
    const result = reorderArray(input, 1, 1);
    expect(result).toEqual(['a', 'b']);
    expect(result).not.toBe(input);
  });

  it('ignores out-of-range indices', () => {
    expect(reorderArray(['a', 'b'], -1, 0)).toEqual(['a', 'b']);
    expect(reorderArray(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});
