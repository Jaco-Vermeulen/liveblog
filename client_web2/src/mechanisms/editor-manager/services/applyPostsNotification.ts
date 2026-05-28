import { enrichPost, type Post } from '@/mechanisms/liveblog-api';
import type { PostsEventPayload, PostsNotificationEntry } from '@/mechanisms/websocket-manager';

export interface PostsNotificationHandlers {
  removePost: (postId: string) => void;
  updatePost: (post: Post) => void;
  addPost: (post: Post) => void;
  fetchNewPage: () => void | Promise<void>;
}

export function postIdFromNotification(entry: PostsNotificationEntry): string | undefined {
  if ('_id' in entry && entry._id) return entry._id;
  if ('post_id' in entry && entry.post_id) return entry.post_id;
  return undefined;
}

function postsForBlog(posts: PostsNotificationEntry[], blogId: string): PostsNotificationEntry[] {
  return posts.filter((p) => !p.blog || p.blog === blogId);
}

/**
 * Apply Liveblog `posts` WebSocket payloads (legacy: pagesManager.applyUpdates / removePost).
 * Deletes must not trigger a full timeline refetch.
 */
export function applyPostsNotification(
  data: PostsEventPayload,
  blogId: string,
  handlers: PostsNotificationHandlers,
): void {
  const posts = postsForBlog(data.posts ?? [], blogId);
  if (!posts.length && !data.scheduled_done) return;

  if (data.deleted) {
    for (const entry of posts) {
      const id = postIdFromNotification(entry);
      if (id) handlers.removePost(id);
    }
    return;
  }

  if (data.updated) {
    for (const entry of posts) {
      if (!('_id' in entry) || !entry._id) continue;
      handlers.updatePost(enrichPost(entry as Post));
    }
    return;
  }

  if (data.created) {
    for (const entry of posts) {
      if (!('_id' in entry) || !entry._id) continue;
      handlers.addPost(enrichPost(entry as Post));
    }
    return;
  }

  if (data.scheduled_done) {
    void handlers.fetchNewPage();
  }
}
