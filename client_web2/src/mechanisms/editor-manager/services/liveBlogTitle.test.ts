import { describe, expect, it } from 'vitest';
import type { Post } from '@/mechanisms/liveblog-api';
import { resolveHeadlineFromPosts, resolveLiveBlogTitle } from './liveBlogTitle';

const basePost = (overrides: Partial<Post>): Post =>
  ({
    _id: '1',
    blog: 'blog-1',
    post_status: 'open',
    groups: [],
    ...overrides,
  }) as Post;

describe('liveBlogTitle', () => {
  it('picks the newest qualifying post headline', () => {
    const posts = [
      basePost({
        _id: 'old',
        headline: 'Older',
        show_headline: true,
        published_date: '2020-06-09T10:00:00.000Z',
      }),
      basePost({
        _id: 'new',
        headline: 'Latest',
        show_headline: true,
        published_date: '2020-06-09T12:00:00.000Z',
      }),
      basePost({
        _id: 'hidden',
        headline: 'Hidden',
        show_headline: false,
        published_date: '2020-06-09T13:00:00.000Z',
      }),
    ];

    expect(resolveHeadlineFromPosts(posts)).toBe('Latest');
  });

  it('falls back to blog settings title', () => {
    expect(
      resolveLiveBlogTitle({ title: 'Settings title', current_headline: null }, []),
    ).toBe('Settings title');
  });

  it('prefers cached current_headline on the blog', () => {
    expect(
      resolveLiveBlogTitle(
        { title: 'Settings title', current_headline: 'Live headline' },
        [],
      ),
    ).toBe('Live headline');
  });
});
