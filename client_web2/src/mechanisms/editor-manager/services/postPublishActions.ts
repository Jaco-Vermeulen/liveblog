import type { Post } from '@/mechanisms/liveblog-api';

const UNPUBLISHED_STATUSES = new Set(['draft', 'submitted', 'scheduled', 'comment']);

const PUBLISHED_DATE_TOLERANCE_MS = 5 * 60 * 1000;

/** True when a post is already live (or scheduled-open) and should not offer Publish. */
export function isPublishedPost(
  post: Pick<Post, 'post_status' | 'published_date'>,
): boolean {
  const status = post.post_status?.trim();
  if (status === 'open') return true;
  if (status && UNPUBLISHED_STATUSES.has(status)) return false;

  if (post.published_date) {
    const ts = Date.parse(post.published_date);
    if (!Number.isNaN(ts) && ts <= Date.now() + PUBLISHED_DATE_TOLERANCE_MS) {
      return true;
    }
  }

  return false;
}

export function canShowPublishAction(
  post: Pick<Post, 'post_status' | 'published_date'>,
): boolean {
  return !isPublishedPost(post);
}

export function canShowUnpublishAction(
  post: Pick<Post, 'post_status' | 'published_date'>,
): boolean {
  return isPublishedPost(post);
}
