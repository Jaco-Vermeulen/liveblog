import { useCallback } from 'react';
import {
  markPostDeleted,
  savePostWithItems,
  updatePostFlags,
  updatePostStatus,
  type Post,
  type PostItem,
} from '@/mechanisms/liveblog-api';

export function usePosts(blogId: string) {
  const savePost = useCallback(
    async (
      items: PostItem[],
      params: {
        post?: Post | null;
        post_status?: string;
        sticky?: boolean;
        lb_highlight?: boolean;
        tags?: string[];
        published_date?: string;
        scheduled?: boolean;
        headline?: string;
        show_headline?: boolean;
        featured_image?: string;
        featured_image_url?: string;
        featured_image_renditions?: Post['featured_image_renditions'];
      } = {},
    ) => {
      const existing = params.post ?? undefined;
      return savePostWithItems(
        blogId,
        items,
        {
          post_status: params.post_status ?? existing?.post_status ?? 'open',
          sticky: params.sticky ?? existing?.sticky ?? false,
          lb_highlight: params.lb_highlight ?? existing?.lb_highlight ?? false,
          tags: params.tags,
          published_date: params.published_date,
          scheduled: params.scheduled,
          headline: params.headline,
          show_headline: params.show_headline,
          featured_image: params.featured_image,
          featured_image_url: params.featured_image_url,
          featured_image_renditions: params.featured_image_renditions,
        },
        existing,
      );
    },
    [blogId],
  );

  const saveDraft = useCallback(
    (
      post: Post | null,
      items: PostItem[],
      sticky: boolean,
      highlight: boolean,
      tags: string[] = [],
    ) =>
      savePost(items, {
        post,
        post_status: 'draft',
        sticky,
        lb_highlight: highlight,
        tags,
      }),
    [savePost],
  );

  const publishPost = useCallback((post: Post) => updatePostStatus(post, 'open'), []);

  const unpublishPost = useCallback((post: Post) => updatePostStatus(post, 'draft'), []);

  const deletePost = useCallback((post: Post) => markPostDeleted(post), []);

  const togglePostPin = useCallback(
    (post: Post) => updatePostFlags(post, { sticky: !post.sticky }),
    [],
  );

  const togglePostHighlight = useCallback(
    (post: Post) => updatePostFlags(post, { lb_highlight: !post.lb_highlight }),
    [],
  );

  return {
    savePost,
    saveDraft,
    publishPost,
    unpublishPost,
    deletePost,
    togglePostPin,
    togglePostHighlight,
  };
}
