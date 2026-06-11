import type { Blog } from '@/mechanisms/liveblog-api';

function themeNameFromBlog(blog: Blog): string | undefined {
  const theme = blog.blog_preferences?.theme;
  if (typeof theme === 'string' && theme.trim()) return theme.trim();
  if (theme && typeof theme === 'object' && 'name' in theme) {
    const name = (theme as { name?: string }).name;
    return name?.trim() || undefined;
  }
  return undefined;
}

function embedPathForBlog(blogId: string, themeName?: string): string {
  return themeName ? `/embed/${blogId}/theme/${themeName}` : `/embed/${blogId}`;
}

function themeNameFromEmbedPath(path: string): string | undefined {
  const match = path.match(/\/embed\/[^/]+\/theme\/([^/?]+)/);
  return match?.[1];
}

function serverOrigin(): string {
  const fromEnv = import.meta.env.VITE_LIVEBLOG_SERVER_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const api = import.meta.env.VITE_LIVEBLOG_API_URL as string | undefined;
  if (api) {
    try {
      const u = new URL(api);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* fall through */
    }
  }
  return 'http://localhost:5000';
}

function sameOriginEmbedPath(url: URL): string | null {
  if (!url.pathname.startsWith('/embed')) return null;
  return `${url.pathname}${url.search}`;
}

/**
 * URL of the themed public embed (real theme CSS + templates from server).
 * Uses a same-origin `/embed/...` path when possible so the admin UI can inject
 * post toolbars into the iframe (cross-origin embeds fall back to React cards).
 */
export function resolveBlogThemePreviewUrl(blog: Blog): string {
  const assignedTheme = themeNameFromBlog(blog);
  const canonicalPath = embedPathForBlog(blog._id, assignedTheme);

  const raw = blog.public_url?.trim();
  if (raw) {
    try {
      const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : undefined);
      const embedPath = sameOriginEmbedPath(u);
      if (embedPath) {
        const urlTheme = themeNameFromEmbedPath(embedPath);
        if (assignedTheme && urlTheme && urlTheme !== assignedTheme) {
          if (import.meta.env.DEV || typeof window !== 'undefined') {
            return canonicalPath;
          }
        }
      }
      if (embedPath && import.meta.env.DEV) {
        return embedPath;
      }
      if (embedPath && typeof window !== 'undefined') {
        const admin = window.location;
        if (u.hostname === admin.hostname) {
          return embedPath;
        }
      }
      return raw;
    } catch {
      return raw;
    }
  }

  const path = canonicalPath;
  if (import.meta.env.DEV) {
    return path;
  }
  if (typeof window !== 'undefined') {
    return path;
  }
  return `${serverOrigin()}${path}`;
}
