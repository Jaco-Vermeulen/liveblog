import { useQuery } from '@tanstack/react-query';
import { listThemes, type Theme } from '@/mechanisms/liveblog-api';
import type { Blog } from '@/mechanisms/liveblog-api';
import { buildThemeStylesheetUrls, normalizeThemeAssetUrl } from '../services/themeAssets';

export interface BlogThemeAssets {
  theme: Theme | null;
  stylesheetUrls: string[];
  assetsRoot: string | null;
}

function themeNameFromBlog(blog: Blog): string | undefined {
  const pref = blog.blog_preferences?.theme;
  return typeof pref === 'string' && pref.trim() ? pref.trim() : undefined;
}

export function useBlogTheme(blog: Blog | undefined) {
  const themeName = blog ? themeNameFromBlog(blog) : undefined;

  const query = useQuery({
    queryKey: ['blog-theme', themeName],
    queryFn: async (): Promise<BlogThemeAssets> => {
      if (!themeName) {
        return { theme: null, stylesheetUrls: [], assetsRoot: null };
      }
      const list = await listThemes();
      const allThemes = list._items;
      const theme = allThemes.find((t) => t.name === themeName) ?? null;
      if (!theme) {
        return { theme: null, stylesheetUrls: [], assetsRoot: null };
      }
      const assetsRoot = theme.public_url
        ? normalizeThemeAssetUrl(theme.public_url.replace(/\/$/, ''))
        : null;
      return {
        theme,
        stylesheetUrls: buildThemeStylesheetUrls(theme, allThemes),
        assetsRoot,
      };
    },
    enabled: Boolean(themeName),
    staleTime: 60_000,
  });

  return {
    theme: query.data?.theme ?? null,
    stylesheetUrls: query.data?.stylesheetUrls ?? [],
    assetsRoot: query.data?.assetsRoot ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
