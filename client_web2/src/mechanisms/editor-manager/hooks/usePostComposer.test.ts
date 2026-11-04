import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Blog, Post } from '@/mechanisms/liveblog-api';
import { usePostComposer } from './usePostComposer';

const savePost = vi.fn();

vi.mock('./usePosts', () => ({
  usePosts: () => ({ savePost }),
}));

vi.mock('@/mechanisms/freetypes-manager', () => ({
  useFreetypesList: () => ({ freetypes: [] }),
  freetypeDataToPostItem: vi.fn(),
}));

const blog: Blog = {
  _id: 'blog-1',
  title: 'Test blog',
  blog_status: 'open',
  original_creator: 'user-1',
};

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    _id: 'post-abc12345',
    blog: 'blog-1',
    post_status: 'open',
    groups: [],
    mainItem: { item: { item_type: 'text', text: '<p>Original text</p>' } },
    ...overrides,
  };
}

describe('usePostComposer', () => {
  beforeEach(() => {
    savePost.mockReset();
    savePost.mockResolvedValue(makePost());
  });

  it('clears edit mode after publish so the same post can be loaded again', async () => {
    const post = makePost();
    const { result } = renderHook(() => usePostComposer(blog));

    act(() => {
      result.current.loadPost(post);
    });
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.updateBlock(0, { text: '<p>Updated text</p>' });
    });
    expect(result.current.composer.isDirty).toBe(true);

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.composer.isDirty).toBe(false);
    expect(result.current.composer.currentPost).toBeNull();

    const sameReference = post;
    act(() => {
      result.current.loadPost({
        ...sameReference,
        mainItem: undefined,
        items: [],
        groups: [
          { id: 'root', refs: [{ idRef: 'main' }] },
          {
            id: 'main',
            refs: [{ item: { item_type: 'text', text: '<p>Original text</p>' } }],
          },
        ],
      });
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.composer.blocks[0]?.data.text).toContain('Original text');
    expect(result.current.composer.editSession).toBeGreaterThan(1);
  });

  it('reuses the previous headline when the pasgemaakte titel field is empty (webhook)', async () => {
    const post = makePost({ headline: 'Vorige titel', show_headline: false });
    const { result } = renderHook(() => usePostComposer(blog, true));

    act(() => {
      result.current.loadPost(post);
      result.current.setHeadline('');
      result.current.updateBlock(0, { text: '<p>Updated body</p>' });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(savePost).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        headline: 'Vorige titel',
        show_headline: false,
      }),
    );
  });

  it('sends a typed headline when the pasgemaakte titel field is filled (webhook)', async () => {
    const post = makePost({ headline: 'Vorige titel', show_headline: false });
    const { result } = renderHook(() => usePostComposer(blog, true));

    act(() => {
      result.current.loadPost(post);
      result.current.setHeadline('Nuwe titel');
      result.current.updateBlock(0, { text: '<p>Updated body</p>' });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(savePost).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        headline: 'Nuwe titel',
        show_headline: false,
      }),
    );
  });

  it('reuses the previous headline when custom title is enabled but empty', async () => {
    const post = makePost({ headline: 'Vorige titel', show_headline: true });
    const { result } = renderHook(() => usePostComposer(blog, false));

    act(() => {
      result.current.loadPost(post);
      result.current.setShowHeadline(true);
      result.current.setHeadline('');
      result.current.updateBlock(0, { text: '<p>Updated body</p>' });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(savePost).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        headline: 'Vorige titel',
        show_headline: true,
      }),
    );
  });

  it('clears the headline when custom title is turned off', async () => {
    const post = makePost({ headline: 'Vorige titel', show_headline: true });
    const { result } = renderHook(() => usePostComposer(blog, false));

    act(() => {
      result.current.loadPost(post);
      result.current.setShowHeadline(false);
      result.current.updateBlock(0, { text: '<p>Updated body</p>' });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(savePost).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        headline: '',
        show_headline: false,
      }),
    );
  });
});
