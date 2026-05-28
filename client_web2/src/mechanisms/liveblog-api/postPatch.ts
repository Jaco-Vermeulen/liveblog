import type { Post } from './endpoints/postsTypes';

/** Fields the Liveblog posts API accepts on PATCH (read-only Eve fields cause 400). */
const POST_PATCH_KEYS = [
  'blog',
  'post_status',
  'sticky',
  'lb_highlight',
  'published_date',
  'groups',
  'deleted',
  'order',
  'tags',
] as const;

export type PostPatchKey = (typeof POST_PATCH_KEYS)[number];

/** Strip client-only / read-only fields before POST or PATCH. */
export function buildPostPatchBody(fields: Partial<Post>): Partial<Post> {
  const body: Partial<Post> = {};
  const source = fields as Record<string, unknown>;
  for (const key of POST_PATCH_KEYS) {
    const value = source[key];
    if (value !== undefined) {
      (body as Record<string, unknown>)[key] = value;
    }
  }
  return body;
}

export function buildNewPostGroups(
  itemIds: Array<{ _id: string; item_type?: string }>,
): Post['groups'] {
  return [
    {
      id: 'root',
      refs: [{ idRef: 'main' }],
      role: 'grpRole:NEP',
    },
    {
      id: 'main',
      refs: itemIds.map((item) =>
        item.item_type === 'poll'
          ? { residRef: item._id, location: 'polls', type: 'poll' }
          : { residRef: item._id },
      ),
      role: 'grpRole:Main',
    },
  ];
}
