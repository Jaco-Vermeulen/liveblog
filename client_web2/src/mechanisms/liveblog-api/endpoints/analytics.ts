import { api } from '../client';
import type { BlogAnalyticsRow, EveList } from '../types';

const PAGE_SIZE = 500;

export function getBlogAnalytics(
  blogId: string,
  page = 1,
  maxResults = PAGE_SIZE,
): Promise<EveList<BlogAnalyticsRow>> {
  return api.get<EveList<BlogAnalyticsRow>>(`/blogs/${blogId}/bloganalytics`, {
    page,
    max_results: maxResults,
  });
}

/** Fetches all pages until no `_links.next` (legacy parity). */
export async function getAllBlogAnalytics(blogId: string): Promise<BlogAnalyticsRow[]> {
  const rows: BlogAnalyticsRow[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const data = await getBlogAnalytics(blogId, page, PAGE_SIZE);
    rows.push(...data._items);
    hasNext = Boolean(data._links?.next);
    page += 1;
  }

  return rows;
}
