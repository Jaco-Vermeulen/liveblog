import type { Blog, BlogStatusCode, LiveblogUser } from '@/mechanisms/liveblog-api';

export type BlogTabName = 'active' | 'archived' | 'deleted';

export interface BlogState {
  name: BlogTabName;
  code: BlogStatusCode;
  label: string;
}

export interface BlogPermissions {
  canOpen: boolean;
  canCreate: boolean;
  canEdit: boolean;
  showCheckbox: boolean;
}

export type { Blog, LiveblogUser };
