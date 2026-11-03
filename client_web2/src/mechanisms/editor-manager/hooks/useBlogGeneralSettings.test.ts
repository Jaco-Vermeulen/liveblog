import { describe, expect, it } from 'vitest';
import type { Blog } from '@/mechanisms/liveblog-api';
import {
  blogToGeneralForm,
  buildBlogPatchFromForm,
  parsePlacementTagsInput,
} from './useBlogGeneralSettings';

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
      blog_key: 'verkiesing-2026',
      placement_tags: ['topstories', 'sa-nuus'],
      main_page_url: '/regstreeks/verkiesing-2026/',
    };

    const form = blogToGeneralForm(blog);
    expect(form.language).toBe('af');
    expect(form.embedResponsive).toBe(true);
    expect(form.themeName).toBe('default');
    expect(form.usersCanComment).toBe('enabled');
    expect(form.postsLimit).toBe(100);
    expect(form.category).toBe('Sport');
    expect(form.blogKey).toBe('verkiesing-2026');
    expect(form.placementTags).toBe('topstories, sa-nuus');
    expect(form.pageUri).toBe('/regstreeks/verkiesing-2026/');
  });
});

describe('parsePlacementTagsInput', () => {
  it('returns null for empty input so the consumer keeps legacy matching', () => {
    expect(parsePlacementTagsInput('')).toBeNull();
    expect(parsePlacementTagsInput('  ')).toBeNull();
  });

  it('splits and trims tags', () => {
    expect(parsePlacementTagsInput('topstories, sa-nuus ,')).toEqual([
      'topstories',
      'sa-nuus',
    ]);
  });
});

describe('buildBlogPatchFromForm', () => {
  it('writes webhook identity fields onto the blog patch', () => {
    const blog: Blog = {
      _id: 'b1',
      title: 'Old',
      blog_status: 'open',
      original_creator: 'u1',
      blog_preferences: { theme: 'default' },
    };
    const form = {
      ...blogToGeneralForm(blog),
      title: 'Verkiesing 2026',
      blogKey: 'verkiesing-2026',
      placementTags: 'topstories, sa-nuus',
      pageUri: '/regstreeks/verkiesing-2026/',
    };
    const patch = buildBlogPatchFromForm(blog, form);
    expect(patch.blog_key).toBe('verkiesing-2026');
    expect(patch.placement_tags).toEqual(['topstories', 'sa-nuus']);
    expect(patch.main_page_url).toBe('/regstreeks/verkiesing-2026/');
  });
});
