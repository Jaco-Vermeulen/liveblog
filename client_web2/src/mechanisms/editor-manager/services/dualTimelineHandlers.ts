import type { Post } from '@/mechanisms/liveblog-api';
import type { PostsNotificationHandlers } from './applyPostsNotification';

/**
 * Route websocket post events to pinned vs main timelines (legacy: lb-sticky true/false lists).
 */
export function createDualTimelineHandlers(
  main: PostsNotificationHandlers,
  pinned: PostsNotificationHandlers,
): PostsNotificationHandlers {
  const removeFromBoth = (postId: string) => {
    main.removePost(postId);
    pinned.removePost(postId);
  };

  const routePost = (post: Post, action: 'add' | 'update') => {
    const id = post._id;
    if (!id) return;

    if (post.sticky) {
      main.removePost(id);
      if (action === 'add') {
        pinned.addPost(post);
      } else {
        pinned.updatePost(post);
      }
    } else {
      pinned.removePost(id);
      if (action === 'add') {
        main.addPost(post);
      } else {
        main.updatePost(post);
      }
    }
  };

  return {
    removePost: removeFromBoth,
    updatePost: (post) => routePost(post, 'update'),
    addPost: (post) => routePost(post, 'add'),
    fetchNewPage: async () => {
      await Promise.all([main.fetchNewPage(), pinned.fetchNewPage()]);
    },
  };
}
