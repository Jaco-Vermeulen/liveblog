import type { Blog } from '@/mechanisms/liveblog-api';

export function resolveEmbedClientOrigin(): string {
  const apiBase = import.meta.env.VITE_LIVEBLOG_API_URL as string | undefined;
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/i, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5000';
}

/** Legacy `blogService.getPublicUrl` — debug fallback to /embed/:id when unset. */
export function resolveBlogPublicUrl(blog: Blog): string {
  if (blog.public_url) {
    const isDev = import.meta.env.DEV;
    return isDev ? blog.public_url : blog.public_url.replace(/^http:\/\//i, 'https://');
  }
  return `${resolveEmbedClientOrigin()}/embed/${blog._id}`;
}

export interface BlogEmbedSnippets {
  normal: string;
  responsive: string;
}

export function buildBlogEmbedSnippets(publicUrl: string): BlogEmbedSnippets {
  const scriptSrc = `${resolveEmbedClientOrigin()}/embed.js`;
  const normal = `<script src="${scriptSrc}" defer></script>
<iframe id="liveblog-iframe" width="100%" height="715" src="${publicUrl}" frameborder="0" allowfullscreen></iframe>`;
  const responsiveSnippet = `<script src="${scriptSrc}" defer></script>
<iframe id="liveblog-iframe" width="100%" scrolling="no" src="${publicUrl}" data-responsive="yes" frameborder="0" allowfullscreen></iframe>`;
  return {
    normal,
    responsive: responsiveSnippet,
  };
}

export function pickBlogEmbedCode(snippets: BlogEmbedSnippets, responsive: boolean): string {
  return responsive ? snippets.responsive : snippets.normal;
}
