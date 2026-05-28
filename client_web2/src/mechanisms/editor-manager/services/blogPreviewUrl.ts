import type { Blog } from '@/mechanisms/liveblog-api';

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
  const raw = blog.public_url?.trim();
  if (raw) {
    try {
      const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : undefined);
      const embedPath = sameOriginEmbedPath(u);
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

  const path = `/embed/${blog._id}`;
  if (import.meta.env.DEV) {
    return path;
  }
  if (typeof window !== 'undefined') {
    return path;
  }
  return `${serverOrigin()}${path}`;
}
