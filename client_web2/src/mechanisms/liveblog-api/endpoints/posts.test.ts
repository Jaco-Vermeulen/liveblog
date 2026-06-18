import { afterEach, describe, expect, it, vi } from 'vitest';
import { __resetLoggerForTests } from '@/mechanisms/request-logger';
import { postsItemPath } from '../paths';
import { buildPostsQueryCriteria } from './postsCriteria';
import { enrichPost, listBlogPosts, mergePostUpdate, savePost, serializePostsQueryCriteria } from './posts';

afterEach(() => {
  __resetLoggerForTests();
  vi.unstubAllGlobals();
});

describe('listBlogPosts', () => {
  it('queries nested blog posts with source criteria', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ _items: [], _meta: { total: 0 } }),
      }),
    );

    await listBlogPosts('507f1f77bcf86cd799439011', { status: 'open' }, 10, 1);

    const url = String(vi.mocked(fetch).mock.calls[0][0]);
    expect(url).toContain('/blogs/507f1f77bcf86cd799439011/posts');
    expect(url).toContain('post_status');
    expect(url).not.toContain('post_filter=');
    const sourceParam = new URL(url, 'http://localhost').searchParams.get('source');
    expect(sourceParam).toBeTruthy();
    const source = JSON.parse(sourceParam!) as { post_filter?: unknown };
    expect(source.post_filter).toBeDefined();
  });
});

describe('serializePostsQueryCriteria', () => {
  it('embeds post_filter inside source JSON like legacy Angular', () => {
    const criteria = buildPostsQueryCriteria({ status: 'open', sticky: false }, 1, 25);
    const params = serializePostsQueryCriteria(criteria);
    expect(params).not.toHaveProperty('post_filter');
    const source = JSON.parse(String(params.source)) as { post_filter?: unknown; query?: unknown };
    expect(source.post_filter).toBeDefined();
    expect(source.query).toBeDefined();
  });
});

describe('postsItemPath', () => {
  it('encodes URN post ids for PATCH', () => {
    const urn =
      'urn:newsml:localhost:2026-05-26T12:48:55.226541:ad14a9d1-04f6-47e0-afaa-73bfec0fd76e';
    expect(postsItemPath(urn)).toBe(`/posts/${encodeURIComponent(urn)}`);
  });
});

describe('savePost', () => {
  it('PATCH strips read-only Eve fields', async () => {
    const urn = 'urn:newsml:localhost:test:abc';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ _id: urn, post_status: 'open' }),
      }),
    );

    await savePost(
      {
        _links: { self: { href: '/posts/x' } },
        _created: '2026-01-01',
        post_status: 'open',
        blog: '507f1f77bcf86cd799439011',
      } as unknown as import('./postsTypes').Post,
      {
        _id: urn,
        _etag: 'etag1',
        blog: '507f1f77bcf86cd799439011',
        post_status: 'open',
        groups: [],
      },
    );

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain(encodeURIComponent(urn));
    const body = JSON.parse(String(init?.body));
    expect(body).toEqual({
      blog: '507f1f77bcf86cd799439011',
      post_status: 'open',
    });
  });
});

describe('enrichPost', () => {
  it('derives mainItem from main group refs', () => {
    const post = enrichPost({
      _id: 'p1',
      blog: 'b1',
      post_status: 'open',
      groups: [
        { id: 'root', refs: [{ idRef: 'main' }] },
        {
          id: 'main',
          refs: [{ item: { item_type: 'text', text: 'Hello' } }],
        },
      ],
    });

    expect(post.mainItem?.item.text).toBe('Hello');
    expect(post.multipleItems).toBe(false);
  });

  it('mergePostUpdate keeps existing body when incoming update omits groups', () => {
    const existing = enrichPost({
      _id: 'p1',
      blog: 'b1',
      post_status: 'open',
      groups: [
        { id: 'root', refs: [{ idRef: 'main' }] },
        {
          id: 'main',
          refs: [{ item: { item_type: 'text', text: 'Saved body' } }],
        },
      ],
    });

    const merged = mergePostUpdate(existing, {
      _id: 'p1',
      blog: 'b1',
      post_status: 'open',
      groups: [],
      content_updated_date: '2026-06-18T10:00:00Z',
    });

    expect(merged.content_updated_date).toBe('2026-06-18T10:00:00Z');
    expect(merged.mainItem?.item.text).toBe('Saved body');
  });
});
