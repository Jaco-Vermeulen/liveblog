import { describe, expect, it } from 'vitest';
import type { Blog, LiveblogUser } from '@/mechanisms/liveblog-api';
import { canAccessBlogSettings, canPublishPost } from './blogSecurity';

const admin: LiveblogUser = {
  _id: 'admin-1',
  username: 'admin',
  user_type: 'administrator',
};

const member: LiveblogUser = {
  _id: 'user-1',
  username: 'editor',
  user_type: 'user',
};

const outsider: LiveblogUser = {
  _id: 'user-2',
  username: 'other',
  user_type: 'user',
};

function blog(overrides: Partial<Blog> = {}): Blog {
  return {
    _id: 'blog-1',
    title: 'Test',
    blog_status: 'open',
    original_creator: 'admin-1',
    members: [{ user: 'user-1' }],
    ...overrides,
  };
}

describe('blogSecurity', () => {
  it('allows admin members to access blog settings', () => {
    expect(canAccessBlogSettings(blog(), admin)).toBe(true);
  });

  it('denies non-member users blog settings', () => {
    expect(canAccessBlogSettings(blog(), outsider)).toBe(false);
  });

  it('allows blog members to publish posts', () => {
    expect(canPublishPost(member, blog())).toBe(true);
  });
});
