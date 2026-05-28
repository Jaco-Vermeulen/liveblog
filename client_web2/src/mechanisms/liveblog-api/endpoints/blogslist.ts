import { api } from '../client';
import type { BlogslistEmbed, EveList } from '../types';

export async function fetchBlogslistEmbedUrl(): Promise<string | null> {
  const result = await api.get<EveList<BlogslistEmbed>>('/blogslist', {
    where: JSON.stringify({ key: 'blogslist' }),
  });
  if (result._items.length > 0 && result._items[0].value) {
    return result._items[0].value;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000/blogslist_embed';
  }

  return null;
}

export function buildBlogslistIframeSnippet(embedUrl: string): string {
  return `<iframe id="liveblog-bloglist" width="100%" scrolling="no" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
}
