import { describe, expect, it } from 'vitest';
import { buildPostPatchBody } from './postPatch';

describe('buildPostPatchBody', () => {
  it('omits read-only Eve metadata that causes PATCH 400', () => {
    const body = buildPostPatchBody({
      blog: '507f1f77bcf86cd799439011',
      post_status: 'open',
      _id: 'urn:newsml:x',
      _etag: 'abc',
      _links: { self: { href: '/posts/x' } },
      _created: '2026-01-01',
      mainItem: { item: { item_type: 'text', text: '' } },
    } as Partial<import('./endpoints/postsTypes').Post>);

    expect(body).toEqual({
      blog: '507f1f77bcf86cd799439011',
      post_status: 'open',
    });
    expect(body).not.toHaveProperty('_links');
    expect(body).not.toHaveProperty('_created');
  });
});
