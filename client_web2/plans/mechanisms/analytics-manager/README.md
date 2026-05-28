# Analytics Manager

Per-blog embed analytics table and CSV export. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Ports legacy `liveblog-analytics` embedded in the blog editor flow: route `/liveblog/analytics/:id`, loads `bloganalytics` for the blog, displays sortable/filterable referrer table, and exports CSV (`blog_id`, `context_url`, `hits`).

## Status

**Phase 6 implemented (2026-05-26)** — `/liveblog/analytics/:id` with table, CSV export, editor nav link.

## Purpose

- Analytics view for a single blog (from editor nav or direct route)
- Paginated fetch of analytics rows (`max_results: 500`, follow `_links.next`)
- **Embeds** tab: table with columns Blog referrer URL (`context_url`) and Hit count (`hits`)
- Client-side sort, filter by referrer, pagination (25 per page — legacy parity)
- **Download CSV** — filename `liveblog_analytics_{blogId}`
- Close returns to blog editor `/liveblog/edit/{id}`

## Current Implementation

- **Legacy:** `client/app/scripts/liveblog-analytics` + activity registered in `liveblog-edit/module.js`
- **Web2:** Planned — see File Structure; may live as subsystem route under **editor-manager** or standalone mechanism exporting components

## Liveblog server / API

| Endpoint | Methods | Usage |
|----------|---------|--------|
| `blogs/{blog_id}/bloganalytics` | `GET` query | `page`, `max_results` (500); paginate until no `next` |

**Route (match legacy):**

| Path | Label | Resolve |
|------|-------|---------|
| `/liveblog/analytics/:id` | Blog Analytics | `blog` by id; blog security → settings permission |

**Note:** Legacy also registers generic `analytics` API resource; blog-specific path above is the one used by the controller.

## Dependencies

- **liveblog-api** (REQUIRED)
- **request-logger** (REQUIRED)
- **auth-manager** (REQUIRED)
- **editor-manager** (REQUIRED) — blog context, nav link from editor chrome
- **style-guide** (REQUIRED) — table, pagination, toolbar

## Dependents

- **editor-manager** — analytics nav button in blog subnav

## Technical Specification

```typescript
interface BlogAnalyticsRow {
  _id: string;
  blog_id: string;
  context_url: string;
  hits: number;
}

interface BlogAnalyticsCollection {
  _items: BlogAnalyticsRow[];
  _meta?: { total: number };
  _links?: { next?: { href: string } };
}

interface AnalyticsManagerApi {
  getBlogAnalytics(blogId: string, page?: number, maxResults?: number): Promise<BlogAnalyticsCollection>;
  getAllBlogAnalytics(blogId: string): Promise<BlogAnalyticsRow[]>;
}

function useBlogAnalytics(blogId: string): {
  rows: BlogAnalyticsRow[];
  loading: boolean;
  error: Error | null;
  refetch(): Promise<void>;
};

function exportAnalyticsCsv(rows: BlogAnalyticsRow[], blogId: string): void;

// Table UI state (legacy lbAnalyticsList directive)
interface AnalyticsTableState {
  predicate: 'context_url' | 'hits' | '';
  reverse: boolean;
  filterText: string;
  pageSize: number; // 25
  currentPage: number;
}
```

**CSV format:** one row per item: `blog_id,context_url,hits` newline-separated (no header in legacy).

**Tabs:** Only `embeds` tab implemented in legacy; `changeTab` stub for future tabs.

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/analytics-manager/
├── index.ts                      # Public exports
├── types.ts                      # BlogAnalyticsRow, collection types
├── api/
│   └── analyticsApi.ts           # bloganalytics endpoint
├── hooks/
│   └── useBlogAnalytics.ts         # Load all pages
├── utils/
│   └── exportCsv.ts              # Blob download helper
├── components/
│   ├── BlogAnalyticsPage.tsx     # Full page shell (style-guide)
│   ├── AnalyticsToolbar.tsx      # Title, Done, Download CSV
│   └── AnalyticsTable.tsx        # Sort, filter, pagination
└── routes.tsx                    # /liveblog/analytics/:id
```

## Design Decisions

- **Route ownership:** Keep path identical to legacy for bookmark parity; register in app router, embed editor subnav link
- **Fetch all pages:** Legacy loads all analytics upfront (“calls aren't expensive”); web2 follows same until server pagination UX is required
- **Filter:** Client-side on `context_url` (legacy `analyticsSearch.context_url`)
- **No WordPress** — Liveblog REST only

## Implementation Approach

1. Add `bloganalytics` to **liveblog-api**
2. Implement `useBlogAnalytics` with chained page fetch
3. Build `AnalyticsTable` + `exportCsv`
4. Wire route + editor nav; security check via **editor-manager** blog resolver
5. Level 2–3 tests

Phase **6** per [plans/README.md](../../README.md#implementation-phases).

## Components

| Component | Purpose | Styling |
|-----------|---------|---------|
| `BlogAnalyticsPage` | Page layout, Embeds tab | style-guide settings view layout |
| `AnalyticsToolbar` | Done, Download CSV | `LbButton` primary |
| `AnalyticsTable` | Data grid | style-guide table / list tokens |

## Usage Examples

```typescript
import { BlogAnalyticsPage } from '@/mechanisms/analytics-manager';

{ path: '/liveblog/analytics/:id', element: <BlogAnalyticsPage /> }

// From editor subnav
<Link to={`/liveblog/analytics/${blog._id}`}>Analytics</Link>
```

## Data Flow

```
BlogAnalyticsPage (blogId from route)
  → useBlogAnalytics
    → analyticsApi.getBlogAnalytics (page 1..n until no next)
  → AnalyticsTable (local sort/filter/page)
  → exportCsv → browser download
```

## Error Handling Strategy

- Load failure: error banner on page; logged request
- Empty data: empty state in table
- CSV: no-op if browser lacks download attribute (legacy guard)

## Related Mechanisms

- [editor-manager](../editor-manager/README.md) — host nav and blog resolve
- [liveblog-api](../liveblog-api/README.md)

## Testing Requirements

| Level | Scope |
|-------|--------|
| **1** | Unit: `exportCsv` row format; pagination slice math |
| **2** | API: `GET blogs/{id}/bloganalytics` against Docker; verify `_items` shape |
| **3** | E2E: open blog editor → analytics → table renders; download CSV file inspect |

## Legacy reference

`client/app/scripts/liveblog-analytics`

- `controllers/controller-analytics.js` — `loadAnalytics`, `downloadCSV`, `close`
- `directives/directives-analytics.js` — `lbAnalyticsList` sort/pagination
- `views/view-analytics.ng1` — Embeds tab shell
- `views/view-list.ng1` — table template
- Activity: `client/app/scripts/liveblog-edit/module.js` — `/liveblog/analytics/:_id`

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
