# Blog List Manager

Blog list, filtering, creation, archive, and delete for Liveblog admin — porting `liveblog-bloglist` to React. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

The primary landing feature after login: grid view of blogs filtered by status (active, archived, deleted), with search, pagination, bulk actions, create-blog modal, embed code, team members, and access-request flows. All REST I/O via **liveblog-api**; UI via **style-guide** inside **navigation-manager** shell.

## Status

**Phase 2 implemented (2026-05-26)** — blog grid, toolbar, bulk actions, create modal, embed modal. Follow-ups: access request modal, server-side search, pagination UI.

## Purpose

- Port legacy `BlogListController` behaviour to React hooks and components
- Routes: `/liveblog`, `/liveblog/active`, `/liveblog/archived`, `/liveblog/deleted`
- List blogs with Elasticsearch-style criteria (status filter + search `q`)
- Create new blogs (title, description, picture, theme, members) → redirect to editor
- Archive/activate blogs via bulk status toggle (`open` ↔ `closed`)
- Soft-delete (`blog_status: deleted`) and permanent delete (deleted tab)
- Upload blog cover image via archive API
- Embed code modal (`blogslist` embed URL)
- Team member picker and blog-level permission checks
- Request membership for restricted blogs

## Current Implementation

- **Legacy:** `client/app/scripts/liveblog-bloglist/` — AngularJS module `liveblog.bloglist`. Controller: `controllers/blog-list.js` (`BlogListController`). States: `controllers/constants.ts` (`ACTIVE`/`ARCHIVED`/`DELETED` → `open`/`closed`/`deleted`). Template: `views/main.ng1`. Directives: `plain-image`, `if-background-image`, `lb-user-select-list`. Security: `liveblog-security.service.js`. Styles: `styles/liveblog-bloglist.scss`.
- **Web2:** `src/mechanisms/blog-list-manager/` — `BlogListPage` at `/liveblog` (+ `/active`, `/archived`, `/deleted`). Grid cards, search, bulk archive/activate/delete, create blog modal, embed code modal.

## Liveblog server / API

All HTTP via **liveblog-api** (no raw `fetch`). Base: `http://localhost:5000/api` (Vite proxy `/api`).

| Resource | Legacy rel | Methods | Usage |
|----------|------------|---------|-------|
| `blogslist` | `blogslist` | `GET` | Embed URL for blog list widget (`/blogslist_embed`) |
| `blogs` | `blogs` | `GET`, `POST`, `PATCH`, `DELETE` | List, create, bulk status update, hard delete |
| `archive` | `archive` | `POST` | Blog cover image upload |
| `themes` | `themes` | `GET` | Theme picker on create blog |
| `global_preferences` | `global_preferences` | `GET` | Default theme preference |
| `request_membership` | — | `GET`, `POST` | Access request for restricted blogs |
| `bandwidth/current` | — | `GET` | Bandwidth limit alert (when enabled) |

**List query:** Eve/Elasticsearch criteria with `blog_status` term filter and optional `query_string` search. Embedded: `original_creator`. Sort and pagination via `max_results`, `page`.

**Status codes (API):** `open` (active), `closed` (archived), `deleted` (soft delete).

## Dependencies

- **liveblog-api** (REQUIRED) — blogs, blogslist, archive, themes, global_preferences
- **request-logger** (REQUIRED) — all HTTP logged via liveblog-api
- **auth-manager** (REQUIRED) — session, blog-level create/open/checkbox permissions
- **navigation-manager** (REQUIRED) — shell outlet for `/liveblog/*` routes
- **style-guide** (REQUIRED) — BlogGrid cards, modals, toolbar, badges

## Dependents

- **editor-manager** — create blog redirects to `/liveblog/edit/:id`; cards link to editor
- **themes-manager** — theme list consumed on create (via liveblog-api, not direct import)

## Technical Specification

### Routes

| React Router path | Legacy route | Filter state | `blog_status` |
|-------------------|--------------|--------------|---------------|
| `/liveblog` | `/liveblog` | active (default) | `open` |
| `/liveblog/active` | `/liveblog/active` | active | `open` |
| `/liveblog/archived` | `/liveblog/archived` | archived | `closed` |
| `/liveblog/deleted` | `/liveblog/deleted` | deleted | `deleted` |

All routes share one page component; tab state derived from path segment.

Post-login default: `/liveblog` (legacy redirect from `/`).

### Core types

```typescript
type BlogStatusCode = 'open' | 'closed' | 'deleted';

interface BlogState {
  name: 'active' | 'archived' | 'deleted';
  code: BlogStatusCode;
  label: string;
}

interface BlogMember {
  user: string;
  role?: string;
}

interface BlogPreferences {
  theme?: string;
  [key: string]: unknown;
}

interface Blog {
  _id: string;
  title: string;
  description?: string;
  blog_status: BlogStatusCode;
  picture_url?: string;
  picture?: string;
  picture_renditions?: Record<string, string>;
  total_posts?: number;
  members?: BlogMember[];
  original_creator: LiveblogUser | { _id: string };
  _etag?: string;
}

interface EveList<T> {
  _items: T[];
  _meta: {
    total: number;
    page?: number;
    max_results?: number;
  };
}

interface BlogListCriteria {
  max_results?: number;
  page?: number;
  embedded: { original_creator: 1 };
  sort: string;
  source: {
    query: {
      filtered: {
        filter: { term: { blog_status: BlogStatusCode } };
        query?: { query_string: { query: string; default_field: string } };
      };
    };
  };
}

interface CreateBlogPayload {
  title: string;
  description: string;
  picture_url?: string;
  picture?: string;
  picture_renditions?: Record<string, string>;
  members: { user: string }[];
  blog_preferences: { theme: string };
}

interface BlogListState {
  blogs: Blog[];
  total: number;
  page: number;
  maxResults: number;
  state: BlogState;
  searchQuery: string;
  selectedIds: Set<string>;
  isLoading: boolean;
  error: string | null;
}

interface Theme {
  _id: string;
  name: string;
  version?: string;
}
```

### Hooks and services

```typescript
const BLOG_STATES: Record<'active' | 'archived' | 'deleted', BlogState>;

function useBlogList(state: BlogState['name']): BlogListState & {
  setSearchQuery(q: string): void;
  setPage(page: number): void;
  refetch(): Promise<void>;
  toggleSelect(id: string): void;
  selectAll(): void;
  clearSelection(): void;
};

function useBlogActions(): {
  createBlog(payload: CreateBlogPayload): Promise<Blog>;
  bulkArchive(ids: string[]): Promise<void>;
  bulkActivate(ids: string[]): Promise<void>;
  softDelete(ids: string[]): Promise<void>;
  permanentDelete(ids: string[]): Promise<void>;
  uploadCoverImage(file: File): Promise<{ url: string; renditions?: Record<string, string> }>;
  fetchEmbedUrl(): Promise<string>;
  requestMembership(blogId: string): Promise<void>;
};

function useBlogPermissions(blog: Blog): {
  canOpen: boolean;
  canCreate: boolean;
  canEdit: boolean;
  showCheckbox: boolean;
};

function buildCriteria(state: BlogState, searchQuery: string, page: number, maxResults: number): BlogListCriteria;
```

### BlogListController feature parity

| Legacy method | Web2 equivalent | Behaviour |
|---------------|-----------------|-----------|
| `fetchBlogs()` | `useBlogList().refetch()` | Query `api.blogs` with criteria |
| `changeState()` | route change `/liveblog/:state` | Switch status filter |
| `openNewBlog()` | open `CreateBlogModal` | Show create form |
| `createBlog()` | `useBlogActions().createBlog()` | POST blog → navigate `/liveblog/edit/:id` |
| `bulkAction()` / `preBulkAction()` | bulk archive/activate | PATCH `blog_status` open↔closed |
| `askRemoveBlog()` | soft delete | PATCH `blog_status: deleted` |
| `askDestroyBlog()` | permanent delete | DELETE (deleted tab only) |
| `upload()` | `uploadCoverImage()` | POST archive multipart |
| `openEmbed()` | embed modal | GET blogslist embed URL |
| `openAccessRequest()` | request membership modal | GET/POST request_membership |
| `setBlogsView('grid')` | grid only | No list view — grid enforced (legacy `localStorage blogsView = 'grid'`) |

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/blog-list-manager/
├── index.ts                      # Public exports: BlogListPage, hooks, constants
├── types.ts                      # BlogState, BlogPermissions
├── constants.ts                  # BLOG_STATES, tabFromPathname, filterBlogsBySearch
├── constants.test.ts
├── hooks/
│   ├── useBlogList.ts            # List state, search, selection, refetch
│   ├── useBlogActions.ts         # Create, archive, delete (via liveblog-api)
│   └── useBlogPermissions.ts     # blogSecurityService port
├── services/
│   └── blogPermissions.ts        # canOpen, canCreate, canBulk*
├── services/blogPermissions.test.ts
└── components/
    ├── BlogListPage.tsx          # Route page: toolbar, grid, modals
    ├── BlogGrid.tsx              # Responsive card grid
    ├── BlogCard.tsx              # Single blog card
    ├── BlogListToolbar.tsx       # Search, create, embed actions
    ├── BulkActionBar.tsx         # Archive / activate / delete selection
    ├── CreateBlogModal.tsx       # Title, description, image, theme
    └── EmbedCodeModal.tsx        # blogslist embed snippet
```

Routes wired in `src/App.tsx` (no separate `routes/` module). HTTP via **liveblog-api** only — no `blogListApi.ts` wrapper files.

**Deferred:** `AccessRequestModal`, `MemberSelectList`, `BlogStateTabs` (tabs via navigation-manager sub-nav). tasks: T-blog-9, T-blog-11

## Design Decisions

- **Grid-only view** — legacy forces grid; no list toggle in web2 Phase 2
- **Route-driven tabs** — `/liveblog/active|archived|deleted` map to `BlogState`; `/liveblog` defaults to active
- **No raw fetch** — all HTTP through **liveblog-api** + **request-logger**
- **Permissions via auth-manager** — `useBlogPermissions` reads session user and legacy privilege rules (`blogs`, `publish_post`, administrator checks)
- **Create → editor redirect** — match legacy: after `createBlog`, navigate to `/liveblog/edit/:id`
- **Soft vs hard delete** — soft delete available on active/archived tabs; permanent delete only on deleted tab
- **Style-guide mandatory** — cards, modals, toolbar use `LbCard`, `LbButton`, `LbBadge`
- **Search debounced** — `query_string` criteria rebuilt on debounced input (legacy searchbar behaviour)

## Implementation Approach

Phase 2 per [plans/README.md](../../README.md#implementation-phases).

1. **Scaffold** — types, constants, API service stubs via liveblog-api
2. **useBlogList** — criteria builder, TanStack Query list fetch, pagination
3. **BlogGrid + BlogCard** — grid layout, background image, metadata, action menu
4. **BlogStateTabs + toolbar** — route-linked tabs, search, bulk selection
5. **useBlogActions** — create, archive, soft/hard delete; smoke against Docker `/api/blogs`
6. **CreateBlogModal** — themes fetch, image upload via archive, member picker
7. **Embed + access modals** — blogslist embed, request_membership
8. **Route wiring** — register under navigation-manager AppShell outlet
9. **Tests + smoke** — Vitest for criteria builder; full-stack list/create/archive on Docker

## Components

All components use **style-guide** tokens. Legacy reference: `views/main.ng1`, `liveblog-bloglist.scss`.

### BlogListPage

- **Purpose:** Main page composing tabs, toolbar, grid, and modals
- **Location:** `components/BlogListPage.tsx`
- **Props:** none (reads route param for state tab)
- **Styling:** page padding within shell outlet, responsive toolbar breakpoints (640px+)

### BlogGrid

- **Purpose:** Responsive grid of blog cards (480px+ multi-column)
- **Location:** `components/BlogGrid.tsx`
- **Props:** `{ blogs: Blog[]; selectedIds: Set<string>; onSelect(id: string): void; onOpen(blog: Blog): void }`
- **Styling:** CSS grid, card hover states, empty state message

### BlogCard

- **Purpose:** Single blog tile — cover image, title, post count, creator, actions
- **Location:** `components/BlogCard.tsx`
- **Props:** `{ blog: Blog; selected: boolean; permissions: BlogPermissions; onSelect(): void; onArchive(): void; onDelete(): void }`
- **Styling:** background image via `picture_url`, checkbox for bulk, status badge

### CreateBlogModal

- **Purpose:** Form to create a new blog — title, description, cover upload, theme, members
- **Location:** `components/CreateBlogModal.tsx`
- **Props:** `{ open: boolean; onClose(): void; onCreated(blog: Blog): void }`
- **Styling:** modal overlay, form fields from style-guide, image preview

## Usage Examples

```tsx
import { BlogListPage } from '@/mechanisms/blog-list-manager';

// Inside navigation-manager AppShell routes
<Route path="/liveblog" element={<BlogListPage />} />
<Route path="/liveblog/active" element={<BlogListPage />} />
<Route path="/liveblog/archived" element={<BlogListPage />} />
<Route path="/liveblog/deleted" element={<BlogListPage />} />
```

```tsx
import { useBlogList, useBlogActions, BlogGrid } from '@/mechanisms/blog-list-manager';

function ActiveBlogs() {
  const { blogs, isLoading, selectedIds, toggleSelect, refetch } = useBlogList('active');
  const { bulkArchive } = useBlogActions();

  if (isLoading) return <LoadingSpinner />;

  return (
    <BlogGrid
      blogs={blogs}
      selectedIds={selectedIds}
      onSelect={toggleSelect}
      onOpen={(blog) => navigate(`/liveblog/edit/${blog._id}`)}
    />
  );
}
```

## Data Flow

```
User lands on /liveblog (authenticated, inside AppShell)
  → BlogListPage mounts
  → useBlogList('active') builds criteria (blog_status: open)
  → liveblog-api GET /blogs?where=…  [request-logger]
  → BlogGrid renders BlogCard items

User searches "rugby"
  → debounced setSearchQuery
  → criteria adds query_string
  → refetch list

User clicks "Create blog"
  → CreateBlogModal opens
  → themesApi GET /themes, GET /global_preferences
  → user fills form, optional uploadCoverImage → POST /archive
  → createBlog → POST /blogs
  → navigate /liveblog/edit/:id

Bulk archive selected
  → bulkArchive(ids) → PATCH blogs (blog_status: closed)
  → refetch

Deleted tab → permanent delete
  → permanentDelete(id) → DELETE /blogs/:id
  → refetch
```

## Error Handling Strategy

| Condition | User-facing behaviour | Logging |
|-----------|----------------------|---------|
| List fetch failure | Error banner with retry | request-logger error |
| Create validation | Inline field errors | — |
| Upload failure | Toast + keep modal open | request-logger error |
| Permission denied | Hide/disable action buttons | — |
| Membership required | AccessRequestModal | request-logger |
| Bandwidth limit (if enabled) | Alert banner | request-logger |

All API errors surfaced via TanStack Query error state or action catch handlers; never silent.

## Related Mechanisms

- **[liveblog-api](../liveblog-api/)** — blogs, archive, themes endpoints
- **[auth-manager](../auth-manager/)** — session and blog-level permissions
- **[navigation-manager](../navigation-manager/)** — shell and main nav link to `/liveblog`
- **[style-guide](../style-guide/)** — grid cards, modals, toolbar
- **[editor-manager](../editor-manager/)** — post-create redirect target

## Testing Requirements

| Level | Scope | Expectation |
|-------|-------|-------------|
| **1 — Unit** | `buildCriteria`, `BLOG_STATES`, permission helpers | Vitest |
| **2 — Integration** | `useBlogList` with mocked liveblog-api | Vitest + MSW |
| **3 — Smoke** | Full stack on Docker | Login → `/liveblog` shows grid; create blog → editor; archive toggles status; deleted tab soft/hard delete |

Dev server: http://localhost:9001. API: http://localhost:5000/api.

## Legacy reference

- `client/app/scripts/liveblog-bloglist/` — module root
- `client/app/scripts/liveblog-bloglist/controllers/blog-list.js` — BlogListController
- `client/app/scripts/liveblog-bloglist/controllers/constants.ts` — IBlogState, ACTIVE/ARCHIVED/DELETED
- `client/app/scripts/liveblog-bloglist/views/main.ng1` — grid template
- `client/app/scripts/liveblog-security.service.js` — blog permission checks

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
