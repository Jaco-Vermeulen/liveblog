import type { BlogState, BlogTabName } from './types';

export const DEFAULT_PAGE_SIZE = 25;

export const BLOG_STATES: Record<BlogTabName, BlogState> = {
  active: {
    name: 'active',
    code: 'open',
    label: 'Aktiewe blogs',
  },
  archived: {
    name: 'archived',
    code: 'closed',
    label: 'Geargiveerde blogs',
  },
  deleted: {
    name: 'deleted',
    code: 'deleted',
    label: 'Verwyderde blogs',
  },
};

export function tabFromPathname(pathname: string): BlogTabName {
  if (pathname.includes('/archived')) return 'archived';
  if (pathname.includes('/deleted')) return 'deleted';
  return 'active';
}

export function filterBlogsBySearch<T extends { title?: string; description?: string }>(
  blogs: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return blogs;
  return blogs.filter((blog) => {
    const title = blog.title?.toLowerCase() ?? '';
    const description = blog.description?.toLowerCase() ?? '';
    return title.includes(q) || description.includes(q);
  });
}
