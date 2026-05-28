import type { Blog, LiveblogUser } from '@/mechanisms/liveblog-api';

function isAdmin(user: LiveblogUser | null): boolean {
  return user?.user_type === 'administrator';
}

function isMemberOfBlog(blog: Blog, userId: string): boolean {
  const creatorId =
    typeof blog.original_creator === 'object'
      ? blog.original_creator._id
      : blog.original_creator;
  if (creatorId === userId) return true;
  return (blog.members ?? []).some((m) => m.user === userId);
}

function isOwnerOrAdmin(blog: Blog, user: LiveblogUser | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const creatorId =
    typeof blog.original_creator === 'object'
      ? blog.original_creator._id
      : blog.original_creator;
  return creatorId === user._id;
}

/** Legacy `blogSecurityService.canAccessSettings`. */
export function canAccessBlogSettings(blog: Blog, user: LiveblogUser | null): boolean {
  if (!user) return false;
  const canManageBlogs = isAdmin(user);
  return canManageBlogs && (isOwnerOrAdmin(blog, user) || isMemberOfBlog(blog, user._id));
}

/** Legacy `blogSecurityService.canPublishAPost` — admins and blog members may edit posts. */
export function canPublishPost(user: LiveblogUser | null, blog?: Blog): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (blog && user._id) return isMemberOfBlog(blog, user._id);
  return user.user_type === 'user';
}
