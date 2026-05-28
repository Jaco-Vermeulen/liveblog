import type { MarketplaceBlog } from '@/mechanisms/liveblog-api';

export function splitBlogsByStartDate(blogs: MarketplaceBlog[]): {
  active: MarketplaceBlog[];
  forthcoming: MarketplaceBlog[];
} {
  const now = Date.now();
  const active: MarketplaceBlog[] = [];
  const forthcoming: MarketplaceBlog[] = [];

  for (const blog of blogs) {
    const start = new Date(blog.start_date).getTime();
    if (start > now) {
      forthcoming.push(blog);
    } else {
      active.push(blog);
    }
  }

  forthcoming.reverse();
  return { active, forthcoming };
}
