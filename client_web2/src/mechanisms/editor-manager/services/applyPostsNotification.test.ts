import { describe, expect, it, vi } from 'vitest';
import { applyPostsNotification, postIdFromNotification } from './applyPostsNotification';

describe('postIdFromNotification', () => {
  it('reads post_id from delete notifications', () => {
    expect(
      postIdFromNotification({
        post_id: 'urn:newsml:localhost:2026:test',
        blog: 'b1',
      }),
    ).toBe('urn:newsml:localhost:2026:test');
  });
});

describe('applyPostsNotification', () => {
  it('removes posts on deleted without refetching the timeline', () => {
    const removePost = vi.fn();
    const fetchNewPage = vi.fn();

    applyPostsNotification(
      {
        deleted: true,
        posts: [{ post_id: 'p1', blog: 'blog-a' }],
      },
      'blog-a',
      {
        removePost,
        fetchNewPage,
        updatePost: vi.fn(),
        addPost: vi.fn(),
      },
    );

    expect(removePost).toHaveBeenCalledWith('p1');
    expect(fetchNewPage).not.toHaveBeenCalled();
  });

  it('updates posts in place on updated notifications', () => {
    const updatePost = vi.fn();
    const fetchNewPage = vi.fn();

    applyPostsNotification(
      {
        updated: true,
        posts: [
          {
            _id: 'p1',
            blog: 'blog-a',
            post_status: 'open',
            groups: [
              { id: 'root', refs: [{ idRef: 'main' }] },
              { id: 'main', refs: [{ item: { item_type: 'text', text: 'Hi' } }] },
            ],
          },
        ],
      },
      'blog-a',
      {
        removePost: vi.fn(),
        updatePost,
        addPost: vi.fn(),
        fetchNewPage,
      },
    );

    expect(updatePost).toHaveBeenCalled();
    expect(fetchNewPage).not.toHaveBeenCalled();
  });
});
