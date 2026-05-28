import type { Theme, ThemeAuthor } from '@/mechanisms/liveblog-api';
import { SYSTEM_THEMES } from '../constants';

const authorRx = /^([^<(]+?)?[ \t]*(?:<([^>(]+?)>)?[ \t]*(?:\(([^)]+?)\)|$)/;

export function parseThemeAuthor(theme: Theme): Theme {
  if (typeof theme.author !== 'string') {
    return theme;
  }
  const match = authorRx.exec(theme.author);
  if (!match) {
    return theme;
  }
  const author: ThemeAuthor = {
    name: match[1]?.trim(),
    email: match[2]?.trim(),
    url: match[3]?.trim(),
  };
  return { ...theme, author };
}

export function enrichThemeFromApi(theme: Theme): Theme {
  const blogs = theme.blogs_data?._items ?? theme.blogs ?? [];
  const parsed = parseThemeAuthor({
    ...theme,
    blogs,
    blogs_count: theme.blogs_data?.total ?? theme.blogs_count ?? blogs.length,
  });
  return parsed;
}

export function isSystemTheme(name: string): boolean {
  return (SYSTEM_THEMES as readonly string[]).includes(name);
}

export function cannotRemoveTheme(theme: Theme, allThemes: Theme[]): boolean {
  const hasChildren = allThemes.some((t) => t.extends === theme.name);
  return hasChildren || isSystemTheme(theme.name);
}
