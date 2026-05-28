import { describe, expect, it } from 'vitest';
import type { Theme } from '@/mechanisms/liveblog-api';
import { cannotRemoveTheme, isSystemTheme, parseThemeAuthor } from './parseTheme';

describe('parseTheme', () => {
  it('parses author string into object', () => {
    const theme: Theme = {
      _id: '1',
      name: 'custom',
      author: 'Jane Doe <jane@example.com> (https://example.com)',
    };
    const parsed = parseThemeAuthor(theme);
    expect(parsed.author).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
      url: 'https://example.com',
    });
  });

  it('blocks removal of system themes and parents with children', () => {
    expect(isSystemTheme('default')).toBe(true);
    const parent: Theme = { _id: 'p', name: 'parent' };
    const child: Theme = { _id: 'c', name: 'child', extends: 'parent' };
    expect(cannotRemoveTheme(parent, [parent, child])).toBe(true);
    expect(cannotRemoveTheme({ _id: 'x', name: 'custom' }, [parent, child])).toBe(false);
  });
});
