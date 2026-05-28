import type { Blog, LiveblogUser } from '@/mechanisms/liveblog-api';
import type { BlogPermissions } from '../types';

function isAdmin(user: LiveblogUser | null): boolean {
  return user?.user_type === 'administrator';
}

function isMemberOfBlog(blog: Blog, userId: string): boolean {
  const creatorId =
    typeof blog.original_creator === 'object'
      ? blog.original_creator._id
      : blog.original_creator;

  if (creatorId === userId) return true;

  return (blog.members ?? []).some((member) => member.user === userId);
}

/** Port of legacy `blogSecurityService` checks used on the blog list grid. */
export function getBlogPermissions(
  blog: Blog,
  user: LiveblogUser | null,
): BlogPermissions {
  const admin = isAdmin(user);
  const userId = user?._id ?? '';
  const member = userId ? isMemberOfBlog(blog, userId) : false;
  const canCreate = admin;

  let showCheckbox = false;
  if (admin) {
    showCheckbox = true;
  } else if (user?.user_type === 'user') {
    showCheckbox = canCreate && member;
  }

  return {
    canOpen: admin || member,
    canCreate,
    canEdit: admin || member,
    showCheckbox,
  };
}

export function canCreateBlog(user: LiveblogUser | null): boolean {
  return isAdmin(user);
}
