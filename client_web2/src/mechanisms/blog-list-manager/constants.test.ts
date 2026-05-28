import { describe, expect, it } from 'vitest';
import { BLOG_STATES, filterBlogsBySearch, tabFromPathname } from './constants';

describe('blog-list-manager constants', () => {
  it('maps routes to tabs', () => {
    expect(tabFromPathname('/liveblog')).toBe('active');
    expect(tabFromPathname('/liveblog/active')).toBe('active');
    expect(tabFromPathname('/liveblog/archived')).toBe('archived');
    expect(tabFromPathname('/liveblog/deleted')).toBe('deleted');
  });

  it('defines blog status codes', () => {
    expect(BLOG_STATES.active.code).toBe('open');
    expect(BLOG_STATES.archived.code).toBe('closed');
    expect(BLOG_STATES.deleted.code).toBe('deleted');
  });

  it('filters blogs by search client-side', () => {
    const blogs = [
      { title: 'Rugby Live', description: 'sport' },
      { title: 'Nuus', description: 'politiek' },
    ];
    expect(filterBlogsBySearch(blogs, 'rugby')).toHaveLength(1);
    expect(filterBlogsBySearch(blogs, '')).toHaveLength(2);
  });
});
