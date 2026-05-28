import { api } from '../client';
import { buildNewPostGroups, buildPostPatchBody } from '../postPatch';
import { itemsPath, postsItemPath } from '../paths';
import { savePollForPost } from './polls';
import type { EveList } from '../types';
import {
  buildPostsQueryCriteria,
  comparePostsBySort,
  type PostsQueryCriteria,
} from './postsCriteria';
import type {
  Post,
  PostFilters,
  PostItem,
  PostItemPayload,
  TimelineSort,
} from './postsTypes';

export type { Post, PostFilters, PostItem, PostItemPayload, TimelineSort } from './postsTypes';
export {
  buildPostsQueryCriteria,
  comparePostsBySort,
  getClientSortKey,
  getClientSortOrder,
} from './postsCriteria';

function criteriaToParams(criteria: PostsQueryCriteria): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: criteria.page ?? 1,
    max_results: criteria.maxResults ?? 15,
    source: JSON.stringify(criteria.source),
  };
  if (criteria.postFilter) {
    params.post_filter = JSON.stringify(criteria.postFilter);
  }
  return params;
}

export function listBlogPosts(
  blogId: string,
  filters: PostFilters = {},
  maxResults = 15,
  page = 1,
): Promise<EveList<Post>> {
  const criteria = buildPostsQueryCriteria(filters, page, maxResults);
  return api.get<EveList<Post>>(`/blogs/${blogId}/posts`, criteriaToParams(criteria));
}

export function getPost(postId: string): Promise<Post> {
  return api.get<Post>(postsItemPath(postId));
}

export function createItem(payload: PostItemPayload): Promise<PostItem & { _id: string }> {
  return api.post<PostItem & { _id: string }>(itemsPath(), payload);
}

export function savePost(post: Partial<Post>, existing?: Post): Promise<Post> {
  const body = buildPostPatchBody(post);
  if (existing?._id && existing._etag) {
    return api.patch<Post>(postsItemPath(existing._id), body, { etag: existing._etag });
  }
  return api.post<Post>('/posts', body);
}

export { buildNewPostGroups, buildPostPatchBody } from '../postPatch';

export function enrichPost(post: Post): Post {
  const mainGroup = post.groups?.find((g) => g.id === 'main') ?? post.groups?.[1];
  const refs = mainGroup?.refs ?? [];
  const multipleItems = refs.length > 1 ? refs.length - 1 : false;

  const items = refs
    .map((ref) => (ref.item ? { item: ref.item } : null))
    .filter((x): x is { item: PostItem } => x !== null);

  const hasComments = items.some((entry) => entry.item.item_type === 'comment');

  return {
    ...post,
    multipleItems,
    mainItem: refs[0] ? { item: refs[0].item ?? { item_type: 'text', text: '' } } : { item: { item_type: 'text', text: '' } },
    items,
    hasComments,
  };
}

export function enrichPosts(posts: Post[]): Post[] {
  return posts.map(enrichPost);
}

type SavedPostRef = PostItem & { _id: string };

async function savePostItem(blogId: string, item: PostItem): Promise<SavedPostRef> {
  if (item.item_type === 'poll' && item.poll_body && typeof item.poll_body === 'object') {
    const pollBody = item.poll_body as import('../types').PollBody;
    const poll = await savePollForPost(blogId, pollBody, item.id_to_update);
    return {
      _id: poll._id,
      item_type: 'poll',
      poll_body: poll.poll_body,
    };
  }

  const saved = await createItem({
    blog: blogId,
    text: item.text,
    meta: item.meta,
    group_type: item.group_type ?? 'default',
    item_type: item.item_type,
    commenter:
      item.meta && typeof item.meta.commenter === 'string'
        ? item.meta.commenter
        : item.commenter,
    syndicated_creator: item.syndicated_creator,
  });
  if (!saved._id) {
    throw new Error('Item save did not return _id');
  }
  return saved;
}

export async function savePostWithItems(
  blogId: string,
  items: PostItem[],
  postPatch: Partial<Post> = {},
  existingPost?: Post,
): Promise<Post> {
  const savedItems = await Promise.all(items.map((item) => savePostItem(blogId, item)));

  const post = buildPostPatchBody({
    blog: blogId,
    post_status: postPatch.post_status ?? existingPost?.post_status ?? 'open',
    sticky: postPatch.sticky ?? existingPost?.sticky ?? false,
    lb_highlight: postPatch.lb_highlight ?? existingPost?.lb_highlight ?? false,
    scheduled: postPatch.scheduled ?? existingPost?.scheduled,
    published_date: postPatch.published_date ?? existingPost?.published_date,
    ...(savedItems.length > 0 ? { groups: buildNewPostGroups(savedItems) } : {}),
  });

  const saved = await savePost(post, existingPost);
  return enrichPost(saved);
}

export function sortPostsClient(posts: Post[], sort: TimelineSort): Post[] {
  return [...posts].sort((a, b) => comparePostsBySort(a, b, sort));
}

export async function updatePostStatus(post: Post, postStatus: string): Promise<Post> {
  const saved = await savePost(
    buildPostPatchBody({ blog: post.blog, post_status: postStatus }),
    post,
  );
  return enrichPost(saved);
}

export async function updatePostFlags(
  post: Post,
  flags: { sticky?: boolean; lb_highlight?: boolean },
): Promise<Post> {
  const saved = await savePost(buildPostPatchBody({ blog: post.blog, ...flags }), post);
  return enrichPost(saved);
}

export async function markPostDeleted(post: Post): Promise<Post> {
  const saved = await savePost(buildPostPatchBody({ blog: post.blog, deleted: true }), post);
  return enrichPost(saved);
}
