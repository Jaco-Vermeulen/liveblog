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
      result.current.loadPost(sameReference);
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.composer.blocks[0]?.data.text).toContain('Original text');
    expect(result.current.composer.editSession).toBeGreaterThan(1);
  });
});
