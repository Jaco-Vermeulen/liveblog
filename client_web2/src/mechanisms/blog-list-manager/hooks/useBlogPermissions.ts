import { useAuth } from '@/mechanisms/auth-manager';
import type { Blog } from '@/mechanisms/liveblog-api';
import { canCreateBlog, getBlogPermissions } from '../services/blogPermissions';
import type { BlogPermissions } from '../types';

export function useBlogPermissions(blog: Blog): BlogPermissions {
  const { state } = useAuth();
  return getBlogPermissions(blog, state.user);
}

export function useCanCreateBlog(): boolean {
  const { state } = useAuth();
  return canCreateBlog(state.user);
}
