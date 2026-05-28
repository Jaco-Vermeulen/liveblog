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

/**
 * URL of the themed public embed (real theme CSS + templates from server).
 * Dev: same-origin path via Vite `/embed` proxy.
 */
export function resolveBlogThemePreviewUrl(blog: Blog): string {
  const raw = blog.public_url?.trim();
  if (raw) {
    try {
      const u = new URL(raw);
      if (import.meta.env.DEV && u.pathname.startsWith('/embed')) {
        return `${u.pathname}${u.search}`;
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
  return `${serverOrigin()}${path}`;
}
