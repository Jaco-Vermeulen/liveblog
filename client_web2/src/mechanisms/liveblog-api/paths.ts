/**
 * Encode resource IDs for URL paths (URNs contain `:` and must be encoded — legacy Angular $resource).
 */
export function encodeResourceId(id: string): string {
  return encodeURIComponent(id);
}

export function postsItemPath(postId: string): string {
  return `/posts/${encodeResourceId(postId)}`;
}

export function blogsItemPath(blogId: string): string {
  return `/blogs/${encodeResourceId(blogId)}`;
}

export function itemsPath(): string {
  return '/items';
}
