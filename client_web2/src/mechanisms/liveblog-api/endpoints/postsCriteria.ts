import type { PostFilters, TimelineSort } from './postsTypes';

export interface PostsQueryCriteria {
  page?: number;
  maxResults?: number;
  source: {
    query: {
      filtered: {
        filter: { and: unknown[] };
      };
    };
    sort?: unknown[];
  };
  postFilter?: { range: Record<string, Record<string, string>> };
}

const TIMELINE_SORTS: Record<TimelineSort, Record<string, Record<string, unknown>>> = {
  editorial: { order: { order: 'desc', missing: '_last', unmapped_type: 'long' } },
  updated_first: { _updated: { order: 'desc', missing: '_last', unmapped_type: 'long' } },
  newest_first: { _created: { order: 'desc', missing: '_last', unmapped_type: 'long' } },
  oldest_first: { _created: { order: 'asc', missing: '_last', unmapped_type: 'long' } },
  editorial_asc: { order: { order: 'asc', missing: '_last', unmapped_type: 'long' } },
};

const PUBLISHED_DATE_TOLERANCE_MS = 5 * 60 * 1000;

function getPostFilters(filters: PostFilters): PostsQueryCriteria['postFilter'] {
  const operator = filters.scheduled ? 'gte' : 'lte';
  const now = Date.now();
  const toleranceAdjustedNow = filters.scheduled
    ? new Date(now - PUBLISHED_DATE_TOLERANCE_MS).toISOString()
    : new Date(now + PUBLISHED_DATE_TOLERANCE_MS).toISOString();
  const publishedDate = filters.maxPublishedDate ?? toleranceAdjustedNow;
  return {
    range: {
      published_date: { [operator]: publishedDate },
    },
  };
}

function applySortField(filters: PostFilters, source: PostsQueryCriteria['source']) {
  if (!filters.sort) return;
  let field = filters.sort;
  let order: 'asc' | 'desc' = 'asc';
  if (field.startsWith('-')) {
    field = field.slice(1);
    order = 'desc';
  }
  source.sort = [
    {
      [field]: { order, missing: '_last', unmapped_type: 'long' },
    },
  ];
}

export function buildPostsQueryCriteria(
  filters: PostFilters = {},
  page = 1,
  maxResults = 15,
): PostsQueryCriteria {
  const excludeDeleted = filters.excludeDeleted !== false;
  const criteria: PostsQueryCriteria = {
    page,
    maxResults,
    source: {
      query: {
        filtered: {
          filter: { and: [] as unknown[] },
        },
      },
    },
  };

  const and = criteria.source.query.filtered.filter.and;

  if (excludeDeleted) {
    and.push({ not: { term: { deleted: true } } });
  }

  if (filters.status !== undefined) {
    and.push({ term: { post_status: filters.status } });
  }

  if (filters.sticky !== undefined) {
    and.push({ term: { sticky: filters.sticky } });
  }

  if (filters.authors && filters.authors.length > 0) {
    and.push({
      or: {
        filters: filters.authors.map((author) => ({ term: { original_creator: author } })),
      },
    });
  }

  if (filters.updatedAfter) {
    and.push({ range: { _updated: { gt: filters.updatedAfter } } });
  }

  if (filters.highlight !== undefined) {
    and.push({ term: { lb_highlight: filters.highlight } });
  }

  if (filters.syndicationIn !== undefined) {
    and.push({ term: { syndication_in: filters.syndicationIn } });
  }

  if (filters.noSyndication) {
    and.push({ missing: { field: 'syndication_in' } });
    (criteria.source.query.filtered.filter as { and: unknown[]; or?: unknown[] }).or = [
      { exists: { field: 'unpublished_date' } },
    ];
  }

  applySortField(filters, criteria.source);

  const excludeScheduled =
    typeof filters.status === 'undefined' || filters.status === 'open';

  if (excludeScheduled) {
    criteria.postFilter = getPostFilters(filters);
  }

  return criteria;
}

export function getClientSortKey(sort: TimelineSort): string {
  return Object.keys(TIMELINE_SORTS[sort])[0];
}

export function getClientSortOrder(sort: TimelineSort): 'asc' | 'desc' {
  const key = getClientSortKey(sort);
  return TIMELINE_SORTS[sort][key].order as 'asc' | 'desc';
}

export function comparePostsBySort(a: { order?: number; _created?: string; _updated?: string }, b: typeof a, sort: TimelineSort): number {
  const key = getClientSortKey(sort);
  const order = getClientSortOrder(sort);
  const av = (a as Record<string, unknown>)[key];
  const bv = (b as Record<string, unknown>)[key];
  if (av === bv) return 0;
  if (av === undefined) return 1;
  if (bv === undefined) return -1;
  if (av == null || bv == null) return 0;
  const cmp = av < bv ? -1 : 1;
  return order === 'asc' ? cmp : -cmp;
}
