import { describe, expect, it } from 'vitest';
import type { Blog } from '@/mechanisms/liveblog-api';
import { blogToGeneralForm } from './useBlogGeneralSettings';

describe('blogToGeneralForm', () => {
  it('maps blog_preferences settings fields into the form', () => {
    const blog: Blog = {
      _id: 'b1',
      title: 'Test Blog',
      blog_status: 'open',
      original_creator: 'u1',
      blog_preferences: {
        theme: 'default',
        language: 'af',
        embed_height_responsive_default: true,
      },
      users_can_comment: 'enabled',
      posts_limit: 100,
      category: 'Sport',
    };

    const form = blogToGeneralForm(blog);
    expect(form.language).toBe('af');
    expect(form.embedResponsive).toBe(true);
    expect(form.themeName).toBe('default');
    expect(form.usersCanComment).toBe('enabled');
    expect(form.postsLimit).toBe(100);
    expect(form.category).toBe('Sport');
  });
});
