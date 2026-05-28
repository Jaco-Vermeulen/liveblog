import { useEffect, useRef } from 'react';
import { LiveblogWsEvent, useWsEvent, type PostsEventPayload } from '@/mechanisms/websocket-manager';

const POSTS_REFETCH_DEBOUNCE_MS = 400;

export interface EditorWebSocketHandlers {
  onPosts?: (data: PostsEventPayload) => void;
  onBlog?: (data: { blog_id: string; published?: number; public_url?: string }) => void;
  onEmbedError?: (data: { blog_id: string; error: string; theme_name?: string }) => void;
  onRemoveTimelinePost?: (data: { post_id: string }) => void;
}

export function useEditorWebSocket(blogId: string, handlers: EditorWebSocketHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const postsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enabled = Boolean(blogId);

  useEffect(() => {
    return () => {
      if (postsDebounceRef.current) {
        clearTimeout(postsDebounceRef.current);
      }
    };
  }, []);

  useWsEvent(
    LiveblogWsEvent.Posts,
    (data) => {
      if (!handlersRef.current.onPosts) return;

      const payload: PostsEventPayload = {
        posts: data.posts ?? [],
        created: data.created,
        updated: data.updated,
        deleted: data.deleted,
        scheduled_done: data.scheduled_done,
      };

      if (postsDebounceRef.current) {
        clearTimeout(postsDebounceRef.current);
      }
      postsDebounceRef.current = setTimeout(() => {
        postsDebounceRef.current = null;
        handlersRef.current.onPosts?.(payload);
      }, POSTS_REFETCH_DEBOUNCE_MS);
    },
    { enabled },
  );

  useWsEvent(
    LiveblogWsEvent.Blog,
    (data) => {
      if (data.blog_id !== blogId) return;
      handlersRef.current.onBlog?.(data);
    },
    { enabled },
  );

  useWsEvent(
    LiveblogWsEvent.EmbedGenerationError,
    (data) => {
      if (data.blog_id !== blogId) return;
      handlersRef.current.onEmbedError?.(data);
    },
    { enabled },
  );

  useWsEvent(
    LiveblogWsEvent.RemoveTimelinePost,
    (data) => {
      const post = data.post;
      if (!post) return;
      if (post.blog && post.blog !== blogId) return;
      handlersRef.current.onRemoveTimelinePost?.({ post_id: post._id });
    },
    { enabled },
  );

}
