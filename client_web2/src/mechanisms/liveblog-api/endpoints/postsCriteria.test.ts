import { describe, expect, it } from 'vitest';
import { buildPostsQueryCriteria, comparePostsBySort } from './postsCriteria';

describe('buildPostsQueryCriteria', () => {
  it('excludes deleted posts by default', () => {
    const criteria = buildPostsQueryCriteria({ status: 'open' });
    const and = criteria.source.query.filtered.filter.and;
    expect(and).toContainEqual({ not: { term: { deleted: true } } });
    expect(and).toContainEqual({ term: { post_status: 'open' } });
    expect(criteria.postFilter).toBeDefined();
  });

  it('applies sticky filter when provided', () => {
    const criteria = buildPostsQueryCriteria({ status: 'open', sticky: true });
    expect(criteria.source.query.filtered.filter.and).toContainEqual({
      term: { sticky: true },
    });
  });

  it('treats missing sticky field as non-sticky when sticky is false', () => {
    const criteria = buildPostsQueryCriteria({ status: 'open', sticky: false });
    expect(criteria.source.query.filtered.filter.and).toContainEqual({
      or: {
        filters: [{ term: { sticky: false } }, { missing: { field: 'sticky' } }],
      },
    });
  });

  it('allows posts missing published_date in post_filter', () => {
    const criteria = buildPostsQueryCriteria({ status: 'open' });
    expect(criteria.postFilter).toEqual({
      or: {
        filters: [
          { range: { published_date: { lte: expect.any(String) } } },
          { missing: { field: 'published_date' } },
        ],
      },
    });
  });
});

describe('comparePostsBySort', () => {
  it('sorts editorial descending by order field', () => {
    const posts = [{ order: 1 }, { order: 3 }, { order: 2 }];
    const sorted = [...posts].sort((a, b) => comparePostsBySort(a, b, 'editorial'));
    expect(sorted.map((p) => p.order)).toEqual([3, 2, 1]);
  });
});
