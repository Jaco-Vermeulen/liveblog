# Syndication Manager

Producer/consumer syndication admin and editor ingest integration. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Ports legacy `liveblog-syndication`: admin page at `/syndication/` with **Producers** and **Consumers** tabs, REST resources for syndication in/out, producers, consumers, and real-time **posts** WebSocket events for ingest notifications in the blog editor.

## Status

**Phase 6 implemented (2026-05-26)** — `/syndication` producers/consumers lists; ingest + WS deferred.

## Purpose

- Syndication admin UI at `/syndication/` (gated by `config.syndication`)
- **Producers** tab: list/create/edit producers, producer blogs, syndicate attach modal
- **Consumers** tab: list/create/edit consumers, contacts, API keys, attach syndicated blogs
- **Syndication in/out** CRUD: link producer blogs to consumer blogs (`auto_publish`, `auto_retrieve`, `blog_token`)
- Editor **ingest panel**: incoming syndication queue, unread posts, syndication switch on blog settings
- WS: subscribe to `posts` events where `posts[0].syndication_in` set — increment ingest notification count (not auto-published)
- Copy-to-clipboard, first-contact flows, attach syndicated blogs modal

## Current Implementation

- **Legacy:** `client/app/scripts/liveblog-syndication` — Flux store, `IngestPanelActions`, `lbProducers`, `lbConsumers`, `lbIngestPanel`, `lbNotificationsCount`
- **Web2:** Planned — see File Structure; editor ingest may integrate with **editor-manager** using exports from this mechanism

## Liveblog server / API

| Resource | Methods | Usage |
|----------|---------|--------|
| `syndication_in` | `GET` query, `PATCH` | Incoming links for consumer blog |
| `syndication_out` | `GET` query | Outgoing links for producer blog |
| `producers` | `GET` query, CRUD | Producer organisations |
| `consumers` | `GET` query, CRUD | Consumer organisations |
| `producers/{id}/blogs` | `GET` | Blogs available to syndicate |
| `producers/{producerId}/syndicate/{producerBlogId}` | `POST` / `DELETE` | Create/remove syndication (body: `consumer_blog_id`, `auto_publish`, `auto_retrieve`) |

**Route:**

| Path | Query | Label |
|------|-------|-------|
| `/syndication/` | `?state=producers` \| `consumers` | Syndication |

**Feature gate:** Module loaded only when `config.syndication === true` (`window.superdeskConfig` or build `SYNDICATION` env). Web2: `VITE_SYNDICATION` or runtime config mirror.

## WebSocket (via websocket-manager)

| Event | Payload | Usage |
|-------|---------|--------|
| `posts` | `{ posts, created?, ... }` | Ingest: if `posts[0].syndication_in` and `auto_publish !== true` and `posts[0].blog === currentBlogId`, increment unread count |

Ingest panel reducer tracks `unreadQueue` filtered by auto-publish rules per `syndication_in` entry.

## Dependencies

- **liveblog-api** (REQUIRED)
- **request-logger** (REQUIRED)
- **websocket-manager** (REQUIRED) — `posts` subscription; no raw WAMP
- **auth-manager** (REQUIRED)
- **editor-manager** — ingest panel, notifications badge in blog editor
- **style-guide** (REQUIRED)

## Dependents

- **editor-manager** — ingest panel, syndication switch, post list syndication markers
- **navigation-manager** — syndication menu item when feature enabled

## Technical Specification

```typescript
interface Producer {
  _id: string;
  name: string;
  // contacts, blogs — see legacy producer-edit-form
}

interface Consumer {
  _id: string;
  name: string;
  contacts: Array<{ first_name: string; last_name?: string; email?: string }>;
}

interface SyndicationIn {
  _id: string;
  blog_id: string;
  producer_blog_id: string;
  blog_token: string;
  auto_publish: boolean;
  auto_retrieve: boolean;
  etag?: string;
}

interface SyndicationOut {
  _id: string;
  blog_id: string;
  consumer_id: string;
}

interface SyndicationManagerApi {
  listProducers(params?: { max_results?: number }): Promise<{ _items: Producer[] }>;
  listConsumers(): Promise<{ _items: Consumer[] }>;
  querySyndicationIn(where: { blog_id: string }): Promise<{ _items: SyndicationIn[] }>;
  querySyndicationOut(where: { blog_id: string }): Promise<{ _items: SyndicationOut[] }>;
  syndicateProducerBlog(params: {
    producerId: string;
    producerBlogId: string;
    consumerBlogId: string;
    autoPublish: boolean;
    autoRetrieve: boolean;
    method?: 'POST' | 'DELETE';
  }): Promise<void>;
  patchSyndicationIn(id: string, data: Partial<SyndicationIn>, etag: string): Promise<SyndicationIn>;
}

type SyndicationTab = 'producers' | 'consumers';

function useSyndicationAdmin(): {
  activeTab: SyndicationTab;
  setTab(tab: SyndicationTab): void;
};

function useIngestPanel(consumerBlogId: string): {
  syndicationIn: SyndicationIn[];
  producers: Producer[];
  producerBlogs: Blog[];
  unreadCount: number;
  syndicate(params: SyndicateParams): Promise<void>;
};

function useSyndicationPosts(blogId: string, panelState: string): {
  unreadCount: number;
};
```

**Tab state:** Legacy `SyndicationController` uses `$route` param `state`; default `producers`.

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/syndication-manager/
├── index.ts                      # Public exports
├── types.ts                      # Producer, Consumer, SyndicationIn/Out
├── api/
│   └── syndicationApi.ts         # REST wrappers (logged)
├── hooks/
│   ├── useSyndicationAdmin.ts    # /syndication/ tabs
│   ├── useIngestPanel.ts         # Editor ingest state
│   └── useSyndicationPosts.ts    # WS unread count
├── components/
│   ├── SyndicationPage.tsx       # Admin shell (style-guide)
│   ├── ProducersTab.tsx          # Producer list + edit
│   ├── ConsumersTab.tsx          # Consumer list + edit
│   ├── ProducerEditForm.tsx      # Producer CRUD
│   ├── ConsumerEditForm.tsx      # Consumer CRUD
│   ├── AttachSyndicatedBlogsModal.tsx
│   ├── IngestPanel.tsx           # Editor ingest UI
│   ├── IncomingSyndicationPanel.tsx
│   └── SyndicationSwitch.tsx     # Blog settings toggle
└── routes.tsx                    # /syndication/ (conditional)
```

## Design Decisions

- **Feature flag:** Do not register routes or nav when syndication disabled (match `client/app/scripts/index.js`)
- **Flux → hooks:** Replace legacy Dispatcher/Store with React state + TanStack Query where appropriate
- **WS only via websocket-manager:** Map `posts` event to `useSyndicationPosts`; log subscription lifecycle
- **Hard-coded max_results:** Legacy `producers.query({max_results: 1000})` — document; consider server pagination later
- **Editor coupling:** Export `IngestPanel` for **editor-manager**; keep syndication domain logic in this mechanism

## Implementation Approach

1. Runtime/config check for syndication enabled
2. Implement `syndicationApi` + admin tabs (producers/consumers)
3. Port producer/consumer edit forms and attach modal
4. Implement ingest panel hooks + components; wire **websocket-manager** `posts`
5. Integrate `SyndicationSwitch` in blog settings (**editor-manager**)
6. E2E against syndication-enabled Docker build

Phase **6** per [plans/README.md](../../README.md#implementation-phases).

## Components

| Component | Purpose | Styling |
|-----------|---------|---------|
| `SyndicationPage` | Tabbed admin | style-guide tabs |
| `ProducersTab` / `ConsumersTab` | Lists | tables, actions |
| `IngestPanel` | Editor side panel | style-guide panel chrome |
| `SyndicationSwitch` | Enable syndication on blog | toggle + consumer list |

## Usage Examples

```typescript
// Conditional route registration
if (config.syndication) {
  routes.push({ path: '/syndication', element: <SyndicationPage /> });
}

// In editor
<IngestPanel blogId={blog._id} />
useSyndicationPosts(blog._id, panelState);
```

## Data Flow

```
SyndicationPage
  → ProducersTab → syndicationApi.listProducers
  → ConsumersTab → syndicationApi.listConsumers
IngestPanel
  → syndicationApi.querySyndicationIn({ blog_id })
  → syndicate → POST/DELETE producers/.../syndicate/...
websocket-manager
  → event posts → useSyndicationPosts → unreadCount++
```

## Error Handling Strategy

- `ON_ERROR` dispatch parity: show API error in ingest panel; flush on retry
- Syndication PATCH: send `If-Match: etag` header (legacy)
- Consumer API key rotation: confirm dialog (legacy copy warns syndication fails until updated)

## Related Mechanisms

- [websocket-manager](../websocket-manager/README.md)
- [editor-manager](../editor-manager/README.md)
- [liveblog-api](../liveblog-api/README.md)

## Testing Requirements

| Level | Scope |
|-------|--------|
| **1** | Unit: unread queue filter (auto_publish); tab state from URL |
| **2** | API: `GET producers`, `GET syndication_in`; syndicate POST against Docker |
| **3** | E2E: `/syndication/?state=consumers`; editor ingest receives WS `posts` with `syndication_in` (see `client/e2e/tests/syndication/`) |

Requires `config.syndication: true` / `SYNDICATION=true` build for module load.

## Legacy reference

`client/app/scripts/liveblog-syndication`

- `activities.js` — `/syndication/`
- `api.js` — syndication_in, syndication_out, consumers, producers
- `controllers/syndication.js` — producers/consumers tabs
- `actions/ingest-panel.js`, `reducers/ingest-panel.js`
- `directives/notifications-count.js` — WS `posts` handler
- `directives/producers.js`, `consumers.js`, `ingest-panel.js`, `incoming-syndication.js`
- Gate: `client/app/scripts/index.js` — `if (config.syndication)`

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
