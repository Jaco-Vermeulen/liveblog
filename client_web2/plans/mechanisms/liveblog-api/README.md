# Liveblog API

Typed REST client for the Liveblog server. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Single entry point for all HTTP calls to the Liveblog REST API (`http://localhost:5000/api`). Wraps `fetch`, integrates **request-logger** on every call, exposes typed resource helpers, and supports TanStack Query at the app layer. **No raw `fetch()` outside this mechanism.**

## Status

**Phases 1–5 implemented (2026-05-26)** — `apiRequest`, auth, blogs, themes (incl. upload/download/redeploy), archive, blogslist, posts (Elasticsearch criteria), polls, outputs, consumers, collections, users, **settings** (languages, global_preferences, instance_settings). All feature HTTP goes through this module.

## Purpose

- Provide typed endpoints for blogs, posts, themes, auth, and shared Superdesk resources
- Centralize base URL, credentials, and error handling
- Log every request/response/error via **request-logger**
- Support cookie/session auth matching legacy Superdesk behaviour
- Enable TanStack Query hooks in feature mechanisms without duplicating fetch logic

## Current Implementation

### Legacy (`client/`)

- **Core API service:** `superdesk-core/scripts/core/api` — resource registry (`api.blogs`, `api.posts`, `api.themes`, …), query/save/update/remove patterns, session cookies
- **Feature services:** `client/app/scripts/liveblog-bloglist/`, `liveblog-edit/`, `liveblog-themes/`, `liveblog-settings/`, etc. — consume `api` injectable
- **Dev server:** Grunt/Webpack with `--server='http://localhost:5000/api'`
- **Auth:** `superdesk-core/scripts/core/auth` — login, session, privileges

### Web2 (`client_web2/`)

- **Vite proxy:** `/api` → `VITE_LIVEBLOG_API_URL` host (default `http://localhost:5000`) — see `vite.config.ts`
- **Env:** `VITE_LIVEBLOG_API_URL=http://localhost:5000/api` in `.env.example`
- **Mechanism:** `src/mechanisms/liveblog-api/` — `client.ts`, `types.ts`, `endpoints/*` (see File Structure)
- **Logging:** every call through **request-logger** via `apiRequest`
- **Consumers:** auth-manager, navigation-manager (indirect), blog-list-manager, editor-manager, settings-manager, themes-manager

## Liveblog server / API

Base URL: `http://localhost:5000/api` (dev). Web2 uses relative `/api/…` paths so Vite proxy forwards to the server.

### Implemented resources

| Resource | Module | Typical operations | Used by |
|----------|--------|-------------------|---------|
| **auth / session** | `endpoints/auth.ts` | login, logout, identity | auth-manager |
| **blogs** | `endpoints/blogs.ts` | list, get, create, patch status, delete | blog-list-manager, editor-manager |
| **posts / items** | `endpoints/posts.ts` | nested list, create items, save post, enrich | editor-manager |
| **themes** | `endpoints/themes.ts` | list, preferences, default, upload/download/redeploy, delete | blog-list-manager, editor-manager, themes-manager, settings-manager |
| **languages** | `endpoints/settings.ts` | list | settings-manager |
| **global_preferences** | `endpoints/settings.ts` | query, patch/post per key | settings-manager, themes-manager |
| **instance_settings** | `endpoints/settings.ts` | query, post `{ settings }` | settings-manager |
| **archive** | `endpoints/archive.ts` | media upload | blog-list-manager |
| **blogslist** | `endpoints/blogslist.ts` | embed URL, iframe snippet | blog-list-manager |
| **polls** | `endpoints/polls.ts` | create, update, save for post | editor-manager |
| **outputs** | `endpoints/outputs.ts` | CRUD blog outputs | editor-manager |
| **consumers** | `endpoints/consumers.ts` | list instance consumers | editor-manager |
| **collections** | `endpoints/collections.ts` | list (output modal) | editor-manager |
| **users** | `endpoints/users.ts` | list (team picker) | editor-manager settings |
| **archive** | `api.archive` | upload URLs | editor-manager |
### Extended resources (later phases)

| Resource | Legacy accessor | Phase |
|----------|-----------------|-------|
| syndicationIn / syndicationOut | `api.syndicationIn`, `api.syndicationOut` | 6 |
| producers / consumers | `api.producers`, `api.consumers` | 6 |
| freetypes | `api.freetypes` | 3–6 |
| marketplace | `api.get('/marketplace/…')` | 6 |
| bandwidth | `api.get('/bandwidth/current')` | 2 |

### Auth and session

- Session cookie set by server on login (legacy Superdesk pattern)
- `credentials: 'include'` on all fetch calls
- Default local Docker credentials: `admin` / `admin`
- Privilege checks remain in feature mechanisms; API returns 403 when unauthorized

### Response shape

Legacy Superdesk resources return Eve-style JSON:

```typescript
interface EveList<T> {
  _items: T[];
  _meta: { total: number; page?: number; max_results?: number };
}

interface EveResource {
  _id: string;
  _etag?: string;
  _created?: string;
  _updated?: string;
}
```

## Dependencies

- **request-logger** (REQUIRED) — every HTTP call logged with correlation id
- **TanStack Query** (app-level) — feature hooks wrap API functions; not a hard dependency inside the mechanism module itself

## Dependents

auth-manager, blog-list-manager, editor-manager, settings-manager, themes-manager, analytics-manager, syndication-manager, marketplace-manager, advertising-manager, freetypes-manager, navigation-manager (user identity)

## Technical Specification

### Environment

```typescript
/** Resolved base — trailing slash stripped */
const API_BASE: string; // import.meta.env.VITE_LIVEBLOG_API_URL ?? 'http://localhost:5000/api'

/** Dev: use relative paths '/api/...' for Vite proxy; prod: full URL */
function resolveUrl(path: string): string;
```

### Core client

```typescript
export class LiveblogApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/** All HTTP traffic flows through this function */
export async function apiRequest<T>(
  path: string,
  options?: ApiRequestOptions,
): Promise<T>;

export interface LiveblogApiClient {
  get<T>(path: string, params?: ApiRequestOptions['params']): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown, etag?: string): Promise<T>;
  delete<T>(path: string, etag?: string): Promise<T>;
}

export const api: LiveblogApiClient;
```

### Domain types (representative)

```typescript
export interface LiveblogUser extends EveResource {
  username: string;
  display_name?: string;
  email?: string;
  user_type?: string;
}

export interface Blog extends EveResource {
  title: string;
  description?: string;
  state?: 'open' | 'closed' | 'deleted';
  public_url?: string;
  theme?: ThemeRef;
  members?: BlogMember[];
}

export interface Post extends EveResource {
  blog: string;
  text?: string;
  content?: unknown[];
  publish_status?: 'draft' | 'published' | 'scheduled';
  highlight?: boolean;
  sticky?: boolean;
}

export interface Theme extends EveResource {
  name: string;
  version?: string;
  extends?: string;
  options?: ThemeOption[];
}

export interface ThemeRef {
  name: string;
  version?: string;
}
```

### Endpoint modules

```typescript
// endpoints/auth.ts
export function login(username: string, password: string): Promise<LiveblogUser>;
export function logout(): Promise<void>;
export function getIdentity(): Promise<LiveblogUser>;

// endpoints/blogs.ts
export function listBlogs(criteria?: BlogQuery): Promise<EveList<Blog>>;
export function getBlog(id: string): Promise<Blog>;
export function createBlog(data: Partial<Blog>): Promise<Blog>;
export function updateBlog(id: string, etag: string, data: Partial<Blog>): Promise<Blog>;
export function deleteBlog(id: string, etag: string): Promise<void>;

// endpoints/posts.ts
export function listBlogPosts(blogId: string, filters?: PostFilters, maxResults?: number, page?: number): Promise<EveList<Post>>;
export function savePostWithItems(blogId: string, items: PostItem[], patch?: Partial<Post>, existing?: Post): Promise<Post>;
export function buildPostsQueryCriteria(filters?: PostFilters, page?: number, maxResults?: number): PostsQueryCriteria;
export function enrichPost(post: Post): Post;

// endpoints/polls.ts
export function createPoll(blogId: string, pollBody: PollBody): Promise<Poll>;
export function savePollForPost(blogId: string, pollBody: PollBody, existingPollId?: string): Promise<Poll>;

// endpoints/outputs.ts
export function listBlogOutputs(blogId: string): Promise<EveList<Output>>;
export function createOutput(payload): Promise<Output>;
export function updateOutput(output: Output, patch: Partial<Output>): Promise<Output>;
export function deleteOutput(output: Output): Promise<Output>;

// endpoints/consumers.ts, collections.ts, users.ts — list helpers

// endpoints/themes.ts
export function listThemes(criteria?: ThemeQuery): Promise<EveList<Theme>>;
export function getTheme(id: string): Promise<Theme>;
```

### Logging contract

Every `apiRequest` call:

1. `const id = logger.request(method, url)`
2. `fetch(url, { credentials: 'include', … })`
3. On success: `logger.response(id, status, durationMs, url)`
4. On failure: `logger.error(id, message, url)` then throw `LiveblogApiError`

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/liveblog-api/
├── index.ts                       # Public exports (api, endpoints, types)
├── client.ts                      # apiRequest + setOnUnauthorized
├── client.test.ts                 # Vitest
├── types.ts                       # Blog, User, Poll, Output, Consumer, Eve types
└── endpoints/
    ├── auth.ts                    # login, getUser, logoutSession
    ├── blogs.ts                   # list, get, create, update status, delete
    ├── blogs.test.ts
    ├── themes.ts                  # list, default, upload/download/redeploy, delete
    ├── settings.ts                # languages, global_preferences, instance_settings
    ├── archive.ts                 # uploadArchiveMedia
    ├── blogslist.ts               # embed URL + iframe snippet
    ├── posts.ts                   # listBlogPosts, savePostWithItems, enrich
    ├── postsTypes.ts              # Post, PostItem, PostFilters, TimelineSort
    ├── postsCriteria.ts           # Elasticsearch criteria builder
    ├── postsCriteria.test.ts
    ├── posts.test.ts
    ├── polls.ts                   # create, update, savePollForPost
    ├── outputs.ts                 # blog output CRUD
    ├── consumers.ts               # listConsumers
    ├── collections.ts             # listCollections
    └── users.ts                   # listUsers
```

Supporting config (not owned by mechanism):

```
vite.config.ts                     # /api proxy to VITE_LIVEBLOG_API_URL
.env.example                       # VITE_LIVEBLOG_API_URL default
```

## Design Decisions

- **No raw fetch outside this module** — enforced by code review and `/validate`
- **Relative `/api` in dev** — Vite proxy avoids CORS; production uses env base URL
- **Superdesk resource parity** — endpoint paths and Eve JSON shapes match legacy `api.*` calls
- **Credentials included** — session cookies, same as legacy Superdesk auth
- **Etag on PATCH/DELETE** — `_etag` header for optimistic concurrency (legacy pattern)
- **TanStack Query at feature layer** — liveblog-api exports plain async functions; hooks live in feature mechanisms

## Implementation Approach

| Phase | Deliverable |
|-------|-------------|
| **1a** | Scaffold `client.ts` + `apiRequest` with logger wiring; smoke `GET /api/` or identity |
| **1b** | `endpoints/auth.ts` — login/logout/identity for auth-manager |
| **1c** | `endpoints/blogs.ts`, `endpoints/themes.ts` — blog-list-manager |
| **3** | `endpoints/posts.ts` — editor-manager |
| **4** | `polls`, `outputs`, `consumers`, `collections`, `users`; poll branch in `savePostWithItems` |
| **5–6** | syndication, freetypes, marketplace, etc. |

Migration workflow per resource:

1. Read legacy `api.*` usage in corresponding `client/app/scripts/liveblog-*` module
2. Map to typed endpoint function
3. Add Vitest mock test + Docker smoke call
4. Wire TanStack Query hook in feature mechanism

## Usage Examples

```typescript
import { api, listBlogs, login } from '@/mechanisms/liveblog-api';

// Direct call (tests, non-React code)
const blogs = await listBlogs({ max_results: 25, state: 'open' });
console.log(blogs._items.length, blogs._meta.total);
```

```typescript
import { useQuery } from '@tanstack/react-query';
import { listBlogs } from '@/mechanisms/liveblog-api';

export function useOpenBlogs() {
  return useQuery({
    queryKey: ['blogs', 'open'],
    queryFn: () => listBlogs({ state: 'open', max_results: 50 }),
  });
}
```

```typescript
import { apiRequest } from '@/mechanisms/liveblog-api/client';

// Low-level access when no endpoint helper exists yet (prefer adding a helper)
const settings = await apiRequest<{ settings: Record<string, unknown> }>(
  '/instance_settings/current',
);
```

## Error Handling Strategy

| HTTP status | Client behaviour |
|-------------|------------------|
| 401 | Throw `LiveblogApiError`; auth-manager redirects to login |
| 403 | Throw with privilege message; feature shows access denied UI |
| 404 | Throw; feature shows not-found state |
| 412 / 409 | Etag conflict — surface retry prompt (legacy parity) |
| 5xx | Throw; log via request-logger; TanStack Query retry policy applies |
| Network error | `logger.error` + throw; no silent retry without logging |

All errors include correlation id traceable in `logger.getHistory()`.

## Related Mechanisms

- **request-logger** (REQUIRED) — logs every call
- **auth-manager** — first consumer; session establishment
- **websocket-manager** — complements REST with real-time updates (not a substitute for API reads)
- **style-guide** — not required by liveblog-api itself (no UI)

## Testing Requirements

| Level | Expectation |
|-------|-------------|
| **1 — Unit (Vitest)** | Mock `fetch`; verify logger.request/response/error called; etag header on PATCH |
| **2 — Integration** | Against Docker API: `GET /api/` health; login with admin/admin; list blogs |
| **3 — Smoke** | auth-manager login flow at http://localhost:9001 hits proxied `/api/auth` |

Validate no `fetch(` in `src/` outside `mechanisms/liveblog-api/client.ts`.

**Test report:** `plans/reports/tests/liveblog-api/2026-05-26/test-summary.md`  
**Rollup:** `plans/reports/tests/phases-2-4/2026-05-26/test-summary.md`

## Legacy reference

- **Core API:** `superdesk-core/scripts/core/api` (imported in `client/app/scripts/index.js`)
- **Auth:** `superdesk-core/scripts/core/auth`
- **Feature usage:** `client/app/scripts/liveblog-bloglist/controllers/blog-list.js`, `liveblog-edit/blog.service.js`, `liveblog-themes/themes.services.js`, `liveblog-settings/controllers/instance-settings.ts`
- **Dev command:** `grunt server --server='http://localhost:5000/api'`

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
