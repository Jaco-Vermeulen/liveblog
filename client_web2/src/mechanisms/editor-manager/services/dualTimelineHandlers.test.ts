import { describe, expect, it, vi } from 'vitest';
import { createDualTimelineHandlers } from './dualTimelineHandlers';
import type { Post } from '@/mechanisms/liveblog-api';

function post(overrides: Partial<Post> = {}): Post {
  return {
    _id: 'p1',
    blog: 'b1',
    post_status: 'open',
    sticky: false,
    groups: [],
    ...overrides,
  } as Post;
}

describe('createDualTimelineHandlers', () => {
  it('routes non-sticky updates to the main timeline only', () => {
    const main = { removePost: vi.fn(), updatePost: vi.fn(), addPost: vi.fn(), fetchNewPage: vi.fn() };
    const pinned = { removePost: vi.fn(), updatePost: vi.fn(), addPost: vi.fn(), fetchNewPage: vi.fn() };
    const handlers = createDualTimelineHandlers(main, pinned);

    handlers.updatePost(post({ sticky: false }));

    expect(pinned.removePost).toHaveBeenCalledWith('p1');
    expect(main.updatePost).toHaveBeenCalled();
    expect(pinned.updatePost).not.toHaveBeenCalled();
  });

  it('routes sticky updates to the pinned timeline only', () => {
    const main = { removePost: vi.fn(), updatePost: vi.fn(), addPost: vi.fn(), fetchNewPage: vi.fn() };
    const pinned = { removePost: vi.fn(), updatePost: vi.fn(), addPost: vi.fn(), fetchNewPage: vi.fn() };
    const handlers = createDualTimelineHandlers(main, pinned);

    handlers.updatePost(post({ sticky: true }));

    expect(main.removePost).toHaveBeenCalledWith('p1');
    expect(pinned.updatePost).toHaveBeenCalled();
    expect(main.updatePost).not.toHaveBeenCalled();
  });

  it('treats missing sticky as non-sticky', () => {
    const main = { removePost: vi.fn(), updatePost: vi.fn(), addPost: vi.fn(), fetchNewPage: vi.fn() };
    const pinned = { removePost: vi.fn(), updatePost: vi.fn(), addPost: vi.fn(), fetchNewPage: vi.fn() };
    const handlers = createDualTimelineHandlers(main, pinned);

    handlers.addPost(post({ sticky: undefined }));

    expect(pinned.removePost).toHaveBeenCalledWith('p1');
    expect(main.addPost).toHaveBeenCalled();
  });
});
