import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { listBlogPosts } from '@/mechanisms/liveblog-api';
import { useTimeline } from './useTimeline';

vi.mock('@/mechanisms/liveblog-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/mechanisms/liveblog-api')>();
  return {
    ...actual,
    listBlogPosts: vi.fn(),
    enrichPosts: (posts: unknown[]) => posts,
    sortPostsClient: (posts: unknown[]) => posts,
  };
});

describe('useTimeline', () => {
  beforeEach(() => {
    vi.mocked(listBlogPosts).mockReset();
    vi.mocked(listBlogPosts).mockResolvedValue({
      _items: [{ _id: 'p1', blog: 'b1', post_status: 'open', groups: [] }],
      _meta: { total: 1, max_results: 15, page: 1 },
    });
  });

  it('does not filter by sticky by default (shows main timeline posts)', async () => {
    const { result } = renderHook(() => useTimeline('blog-1', { panel: 'editor' }));

    await waitFor(() => {
      expect(result.current.posts.length).toBe(1);
    });

    expect(listBlogPosts).toHaveBeenCalledWith(
      'blog-1',
      expect.objectContaining({
        status: 'open',
        sticky: undefined,
      }),
      15,
      1,
    );
  });

  it('can request pinned posts only when sticky is true', async () => {
    renderHook(() => useTimeline('blog-1', { panel: 'timeline', sticky: true }));

    await waitFor(() => {
      expect(listBlogPosts).toHaveBeenCalled();
    });

    expect(listBlogPosts).toHaveBeenCalledWith(
      'blog-1',
      expect.objectContaining({
        status: 'open',
        sticky: true,
      }),
      15,
      1,
    );
  });
});
