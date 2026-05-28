import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetLoggerForTests } from '@/mechanisms/request-logger';
import { listBlogs, updateBlog } from './blogs';
import type { Blog } from '../types';

afterEach(() => {
  __resetLoggerForTests();
  vi.unstubAllGlobals();
});

describe('listBlogs', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          _items: [{ _id: '1', title: 'Test', blog_status: 'open' }],
          _meta: { total: 1 },
        }),
      }),
    );
  });

  it('queries blogs with blog_status where clause', async () => {
    const result = await listBlogs({ blogStatus: 'open', maxResults: 10 });
    expect(result._items).toHaveLength(1);

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalled();
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('blog_status');
    expect(url).toContain('open');
  });
});

describe('updateBlog', () => {
  const blog: Blog = {
    _id: 'blog1',
    _etag: 'etag-1',
    title: 'My Blog',
    blog_status: 'open',
    original_creator: { _id: 'user1', username: 'admin' },
    blog_preferences: { theme: 'default' },
  };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ...blog, description: 'updated' }),
      }),
    );
  });

  it('PATCHes only patch fields and required ids, not Eve metadata', async () => {
    await updateBlog(blog, { description: 'updated', blog_status: 'closed' });

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PATCH');
    const headers = init.headers as Headers;
    expect(headers.get('If-Match')).toBe('etag-1');

    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).toEqual({
      original_creator: 'user1',
      title: 'My Blog',
      description: 'updated',
      blog_status: 'closed',
    });
    expect(body).not.toHaveProperty('_etag');
    expect(body).not.toHaveProperty('_created');
    expect(body).not.toHaveProperty('_links');
  });
});
