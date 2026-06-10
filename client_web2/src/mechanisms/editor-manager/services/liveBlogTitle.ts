import type { Post } from '@/mechanisms/liveblog-api';

export function resolveHeadlineFromPosts(posts: Post[]): string | null {
  const now = Date.now();
  const candidates = posts.filter((post) => {
    if (post.post_status !== 'open' || post.deleted) return false;
    if (!post.show_headline || !post.headline?.trim()) return false;
    if (post.published_date && new Date(post.published_date).getTime() > now) return false;
    return true;
  });

  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    const aDate = a.published_date ? new Date(a.published_date).getTime() : 0;
    const bDate = b.published_date ? new Date(b.published_date).getTime() : 0;
    return bDate - aDate;
  });

  return candidates[0].headline!.trim();
}

export function resolveLiveBlogTitle(
  blog: { title: string; current_headline?: string | null },
  posts: Post[] = [],
): string {
  const cached = blog.current_headline?.trim();
  if (cached) return cached;

  const fromPosts = resolveHeadlineFromPosts(posts);
  if (fromPosts) return fromPosts;

  return blog.title;
}
