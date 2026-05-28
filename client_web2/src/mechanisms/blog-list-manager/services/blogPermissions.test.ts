import { describe, expect, it } from 'vitest';
import type { Blog, LiveblogUser } from '@/mechanisms/liveblog-api';
import { getBlogPermissions } from './blogPermissions';

const admin: LiveblogUser = {
  _id: 'admin1',
  username: 'admin',
  user_type: 'administrator',
};

const member: LiveblogUser = {
  _id: 'user1',
  username: 'reporter',
  user_type: 'user',
};

function blog(overrides: Partial<Blog> = {}): Blog {
  return {
    _id: 'b1',
    title: 'Test',
    blog_status: 'open',
    original_creator: admin,
    members: [{ user: 'user1' }],
    ...overrides,
  };
}

describe('blogPermissions', () => {
  it('allows admin full access', () => {
    const p = getBlogPermissions(blog(), admin);
    expect(p.canOpen).toBe(true);
    expect(p.showCheckbox).toBe(true);
    expect(p.canCreate).toBe(true);
  });

  it('allows member to open blog', () => {
    const p = getBlogPermissions(blog(), member);
    expect(p.canOpen).toBe(true);
    expect(p.showCheckbox).toBe(false);
  });

  it('denies non-member user', () => {
    const p = getBlogPermissions(
      blog({ members: [], original_creator: 'other' }),
      member,
    );
    expect(p.canOpen).toBe(false);
    expect(p.showCheckbox).toBe(false);
  });
});
