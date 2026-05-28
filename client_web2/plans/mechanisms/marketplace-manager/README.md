# Marketplace Manager

Cross-organisation blog marketplace browse and embed. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Ports legacy `liveblog-marketplace`: admin page at `/marketplace/` (gated by `config.marketplace`) with **Marketers** / **Producers** tabs, search panel, filters persisted in route params, and marketplace-specific blog listing with embed preview modal.

## Status

**Phase 6 implemented (2026-05-26)** — `/marketplace` browse + filters; embed preview stub; requires `VITE_MARKETPLACE` in prod nav.

## Purpose

- Marketplace page at `/marketplace/` when feature enabled
- Load blogs via `/marketplace/blogs` with `where` filters and `sort: -start_date`
- Load marketers via `/marketplace/marketers` and languages via `/marketplace/languages`
- Search panel toggle; filter by marketer, language, etc. (legacy `toggleFilter`)
- Split blogs into active vs forthcoming (`start_date` vs now)
- Blog preview / embed modal (`openEmbedModal`)
- Persist filters in URL: `?filters={json}` (legacy `$route.updateParams`)
- **Marketers** vs **Producers** tab switch (legacy `$scope.states`)

## Current Implementation

- **Legacy:** `client/app/scripts/liveblog-marketplace` — Flux `MarketplaceActions` / `MarketplaceReducers`, `MarketplaceController`, directives `lbBlogsList`, `lbSearchPanel`, `lbSearchFilter`, `lbBlogPreviewModal`, `lbMarketplaceSwitch`
- **Web2:** Planned — see File Structure

## Liveblog server / API

| Path | Methods | Usage |
|------|---------|--------|
| `/marketplace/blogs` | `GET` | Query params: `where` (filters object), `sort: '-start_date'` |
| `/marketplace/marketers` | `GET` | Marketer list for filter panel |
| `/marketplace/languages` | `GET` | Language filter options |

**Route:**

| Path | Label |
|------|-------|
| `/marketplace/` | Marketplace |

**Feature gate:** Module loaded only when `config.marketplace === true` (`window.superdeskConfig` or build `MARKETPLACE` env). Web2: `VITE_MARKETPLACE` or runtime config.

**Blog editor:** `lbMarketplaceSwitch` directive toggles `marketEnabled` on blog (used in blog settings) — port to **editor-manager** or this mechanism.

## Dependencies

- **liveblog-api** (REQUIRED) — `api.get('/marketplace/...')` wrappers
- **request-logger** (REQUIRED)
- **auth-manager** (REQUIRED)
- **navigation-manager** — menu when marketplace enabled
- **style-guide** (REQUIRED)

## Dependents

- **editor-manager** — marketplace switch on blog settings

## Technical Specification

```typescript
interface MarketplaceBlog {
  _id: string;
  title: string;
  start_date: string;
  marketer?: { _id: string; name: string };
  // additional fields from API
}

interface MarketplaceMarketer {
  _id: string;
  name: string;
}

interface MarketplaceLanguage {
  _id: string;
  name: string;
}

interface MarketplaceFilters {
  marketer?: { _id: string };
  language?: string;
  [key: string]: unknown;
}

interface MarketplaceManagerApi {
  getBlogs(filters: MarketplaceFilters): Promise<{ _items: MarketplaceBlog[] }>;
  getMarketers(): Promise<{ _items: MarketplaceMarketer[] }>;
  getLanguages(): Promise<{ _items: MarketplaceLanguage[] }>;
}

function useMarketplace(): {
  blogs: MarketplaceBlog[];
  forthcomingBlogs: MarketplaceBlog[];
  marketers: MarketplaceMarketer[];
  languages: MarketplaceLanguage[];
  filters: MarketplaceFilters;
  searchPanelOpen: boolean;
  embedModalBlog: MarketplaceBlog | null;
  setFilters(filters: MarketplaceFilters): void;
  toggleFilter(type: string, value: unknown): void;
  toggleSearchPanel(): void;
  openEmbedModal(blog: MarketplaceBlog): void;
  closeEmbedModal(): void;
};

type MarketplaceTab = 'Marketers' | 'Producers';
```

**Filter URL:** Serialize `filters` to route search param `filters` JSON string on change (legacy behaviour).

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/marketplace-manager/
├── index.ts                      # Public exports
├── types.ts                      # MarketplaceBlog, filters
├── api/
│   └── marketplaceApi.ts         # /marketplace/* endpoints
├── hooks/
│   └── useMarketplace.ts         # Blogs, filters, modals
├── components/
│   ├── MarketplacePage.tsx       # Main page (style-guide)
│   ├── MarketplaceTabs.tsx       # Marketers / Producers
│   ├── SearchPanel.tsx           # Filter sidebar
│   ├── SearchFilter.tsx          # Individual filter chips
│   ├── BlogsList.tsx             # Active + forthcoming lists
│   ├── BlogPreviewModal.tsx      # Embed preview
│   └── MarketplaceSwitch.tsx     # Blog setting toggle
└── routes.tsx                    # /marketplace/ (conditional)
```

## Design Decisions

- **Feature flag:** Register routes/nav only when `config.marketplace` true
- **Date split:** Use same moment logic as legacy — forthcoming if `start_date` in future
- **Empty states:** `emptyMarketer` when no marketer filter; `emptyBlogs` when both lists empty
- **Error on filter:** Legacy dispatches empty blogs on catch — show error toast in web2 instead of silent empty
- **No Flux:** React state + URL search params for filters

## Implementation Approach

1. Config gate + route registration
2. `marketplaceApi` + `useMarketplace`
3. Build search panel, blogs list, preview modal
4. Port `MarketplaceSwitch` for editor blog settings
5. Level 2–3 API and E2E tests

Phase **6** per [plans/README.md](../../README.md#implementation-phases).

## Components

| Component | Purpose | Styling |
|-----------|---------|---------|
| `MarketplacePage` | Layout with tabs | style-guide |
| `SearchPanel` | Filters + toggle | drawer/panel tokens |
| `BlogsList` | Blog cards/rows | list components |
| `BlogPreviewModal` | Embed code preview | modal from style-guide |
| `MarketplaceSwitch` | Blog marketplace flag | toggle |

## Usage Examples

```typescript
if (config.marketplace) {
  routes.push({ path: '/marketplace', element: <MarketplacePage /> });
}

const { filters, setFilters, blogs } = useMarketplace();
// URL: /marketplace?filters={"marketer":{"_id":"..."}}
```

## Data Flow

```
MarketplacePage mount
  → marketplaceApi.getMarketers, getLanguages
  → marketplaceApi.getBlogs(filters from URL or {})
User toggles filter
  → toggleFilter → getBlogs → update blogs state + URL filters JSON
User opens blog
  → openEmbedModal → BlogPreviewModal
```

## Error Handling Strategy

- Initial load failure: page error + retry
- Filter request failure: notify user (improve on legacy empty fallback)
- Embed modal: handle missing public URL gracefully

## Related Mechanisms

- [editor-manager](../editor-manager/README.md) — marketplace switch
- [liveblog-api](../liveblog-api/README.md)
- [navigation-manager](../navigation-manager/README.md)

## Testing Requirements

| Level | Scope |
|-------|--------|
| **1** | Unit: forthcoming vs active split; filter URL serialize/parse |
| **2** | API: `GET /marketplace/blogs`, `/marketers`, `/languages` with logging |
| **3** | E2E: `/marketplace/` loads; apply marketer filter; open embed modal |

Requires `config.marketplace: true` / `MARKETPLACE=true` build.

## Legacy reference

`client/app/scripts/liveblog-marketplace`

- `index.js` — module, `/marketplace/` activity
- `controllers/marketplace.js` — Flux store connect, tab state
- `actions/marketplace.js` — `getBlogs`, `getMarketers`, `getLanguages`, `toggleFilter`
- `directives/blogs-list.js`, `search-panel.js`, `search-filter.js`, `blog-preview-modal.js`, `marketplace-switch.js`
- Gate: `client/app/scripts/index.js` — `if (config.marketplace)`
- Config: `client/app/config.js` — `marketplace: true`

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
