# Advertising Manager

Global advertisements and collections management. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Ports legacy `liveblog-advertising`: admin page at `/advertising/` with **Adverts** and **Collections** tabs, CRUD on `advertisements` and `collections`, freetype-driven advert templates (local/remote), and adblock detection banner.

## Status

**Phase 6 implemented (2026-05-26)** — `/advertising` adverts + collections tabs; freetype advert templates deferred.

## Purpose

- Advertising manager at `/advertising/` (admin tools; `global_preferences` privilege)
- **Adverts** tab: list non-deleted advertisements; create/edit modal with freetype template rendering
- **Collections** tab: group advertisements; soft-delete via `deleted: true`
- Advert types: **Advertisement Local**, **Advertisement Remote** (templates from `liveblog-edit` ads views)
- Save advert: `name`, `type`, `text` (HTML from freetype template + data), `meta.data`
- Privilege `advertisements_delete` for remove actions
- Unique name validation within list (`adsUtilSevice.uniqueNameInItems`)
- Adblock detect on page load (informational UI)

## Current Implementation

- **Legacy:** `client/app/scripts/liveblog-advertising` — `LiveblogAdvertisingController`, modals, depends on `liveblog.edit` for templates
- **Web2:** Planned — see File Structure; freetype rendering coordinates with **freetypes-manager** patterns

## Liveblog server / API

| Resource | Methods | Usage |
|----------|---------|--------|
| `advertisements` | `GET` query `{ where: { deleted: false } }`, `save`, `remove` | Adverts CRUD |
| `collections` | `GET` query `{ where: { deleted: false } }`, `save` with `{ deleted: true }` | Collections CRUD |

**Route:**

| Path | Label |
|------|-------|
| `/advertising/` | Advertising manager |

**Advert payload (save):**

```typescript
{
  name: string;
  type: 'Advertisement Local' | 'Advertisement Remote';
  text: string;       // rendered HTML from freetype template
  meta: { data: Record<string, unknown> };
}
```

**Collection payload:**

```typescript
{
  name: string;
  advertisements: Array<{ advertisement_id: string }>;
}
```

## Dependencies

- **liveblog-api** (REQUIRED)
- **request-logger** (REQUIRED)
- **auth-manager** (REQUIRED) — `advertisements_delete` privilege
- **freetypes-manager** (RECOMMENDED) — template variable model and HTML render helper
- **style-guide** (REQUIRED)

## Dependents

- **editor-manager** — blog-level ad local/remote panels use same advert types and freetype data

## Technical Specification

```typescript
interface Advertisement {
  _id?: string;
  name: string;
  type: string;
  text: string;
  meta: { data: Record<string, unknown> };
  deleted?: boolean;
}

interface AdvertCollection {
  _id?: string;
  name: string;
  advertisements: Array<{ advertisement_id: string }>;
  deleted?: boolean;
}

interface AdvertTypeDefinition {
  name: 'Advertisement Local' | 'Advertisement Remote';
  templateHtml: string;
}

interface AdvertisingManagerApi {
  listAdvertisements(): Promise<Advertisement[]>;
  saveAdvertisement(existing: Advertisement | null, payload: Partial<Advertisement>): Promise<Advertisement>;
  removeAdvertisement(advert: Advertisement): Promise<void>;
  listCollections(): Promise<AdvertCollection[]>;
  saveCollection(existing: AdvertCollection | null, payload: Partial<AdvertCollection>): Promise<AdvertCollection>;
  removeCollection(collection: AdvertCollection): Promise<void>;
}

function useAdvertisingManager(): {
  activeTab: 'adverts' | 'collections';
  adverts: Advertisement[];
  collections: AdvertCollection[];
  loading: boolean;
  adblockDetected: boolean;
  setTab(tab: 'adverts' | 'collections'): void;
  openAdvertDialog(ad?: Advertisement): void;
  openCollectionDialog(collection?: AdvertCollection): void;
};

function renderAdvertHtml(template: string, freetypesData: Record<string, unknown>): string;
```

**Freetype validation:** `freetypeValid()` — all validation keys true before save (legacy).

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/advertising-manager/
├── index.ts                      # Public exports
├── types.ts                      # Advertisement, AdvertCollection
├── api/
│   └── advertisingApi.ts         # advertisements, collections
├── hooks/
│   └── useAdvertisingManager.ts  # Tabs, lists, modals
├── services/
│   ├── renderAdvertTemplate.ts   # Port freetypeService.htmlContent
│   └── uniqueName.ts             # uniqueNameInItems port
├── components/
│   ├── AdvertisingPage.tsx       # Main shell (style-guide)
│   ├── AdvertsTab.tsx            # List + actions
│   ├── CollectionsTab.tsx        # List + actions
│   ├── AdvertModal.tsx           # Create/edit advert
│   ├── CollectionModal.tsx       # Pick adverts for collection
│   └── AdblockBanner.tsx         # Detected adblock notice
└── routes.tsx                    # /advertising/
```

## Design Decisions

- **Templates:** Port local/remote HTML templates from legacy `liveblog-edit/views/ads-local.ng1` and `ads-remote.ng1` as static template strings or React components
- **Freetype render:** Shared util with **freetypes-manager** `$variable` substitution rules
- **Soft delete collections:** `save` with `{ deleted: true }` not HTTP DELETE (legacy)
- **Remove advert:** `api.remove` with 403 messaging for permissions
- **adblock-detect:** Optional dependency; show non-blocking banner

## Implementation Approach

1. `advertisingApi` endpoints in **liveblog-api**
2. Port advert/collection modals with freetype fields
3. Implement tabs and list views with style-guide
4. Wire route + nav under admin tools
5. Tests: CRUD round-trip against API

Phase **6** per [plans/README.md](../../README.md#implementation-phases).

## Components

| Component | Purpose | Styling |
|-----------|---------|---------|
| `AdvertisingPage` | Tab shell | style-guide |
| `AdvertModal` | Freetype fields for local/remote | form layout |
| `CollectionModal` | Checkbox grid of adverts | modal |
| `AdblockBanner` | Warning if blocker detected | alert token |

## Usage Examples

```typescript
import { AdvertisingPage } from '@/mechanisms/advertising-manager';

{ path: '/advertising', element: <AdvertisingPage /> }

await advertisingApi.saveAdvertisement(ad, {
  name: 'Banner 1',
  type: 'Advertisement Local',
  text: renderAdvertHtml(template, data),
  meta: { data },
});
```

## Data Flow

```
AdvertisingPage
  → AdvertsTab → listAdvertisements
  → AdvertModal → renderAdvertHtml → saveAdvertisement
  → CollectionsTab → listCollections
  → CollectionModal → load adverts → saveCollection with advertisement_id[]
```

## Error Handling Strategy

- Load errors: toast “error getting the advertisements/collections”
- Save errors: generic retry message (5s notify legacy)
- Remove 403: permission-specific copy for advertisements
- Freetype validation failure: block save, inline field errors

## Related Mechanisms

- [freetypes-manager](../freetypes-manager/README.md) — template variables
- [editor-manager](../editor-manager/README.md) — blog ads panels
- [liveblog-api](../liveblog-api/README.md)

## Testing Requirements

| Level | Scope |
|-------|--------|
| **1** | Unit: `renderAdvertHtml`; `uniqueName`; collection `advertisement_id` mapping |
| **2** | API: create advert, list, soft-delete collection |
| **3** | E2E: `/advertising/` → create local advert → appears in list → add to collection |

## Legacy reference

`client/app/scripts/liveblog-advertising`

- `activities.js` — `/advertising/`
- `controllers/advertising.js` — `LiveblogAdvertisingController`
- `ads-util.service.js` — unique name helper
- `views/main.ng1`, `advert-modal.ng1`, `collection-modal.ng1`
- Templates: `client/app/scripts/liveblog-edit/views/ads-local.ng1`, `ads-remote.ng1`
- Module depends on `liveblog.edit` for freetype service patterns

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
