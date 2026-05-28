# Blog List Manager — Comments

## 2026-05-26 — Phase 2 implementation

Implemented blog list grid at `/liveblog`, `/liveblog/active`, `/liveblog/archived`, `/liveblog/deleted`.

- All HTTP via **liveblog-api** (`listBlogs`, `createBlog`, `updateBlogStatus`, `deleteBlog`, themes, archive upload, blogslist embed).
- Eve `where` uses simple `{ blog_status }` filter (ES `filtered` query returns 500 on current Docker stack).
- Search debounced client-side on fetched page until server-side query_string is validated.
- Access request flow stubbed (`window.alert`) — follow-up task.
- Create blog redirects to `/liveblog/edit/:id` (editor-manager Phase 3).

Smoke: `node client_web2/scripts/smoke-blogs.mjs` — login + list open blogs OK.

## 2026-05-26 — Documentation sweep

README File Structure synced to actual tree (hooks call liveblog-api directly). Test report: `plans/reports/tests/blog-list-manager/2026-05-26/`.

## 2026-05-27 — List scale + access (T-blog-9, T-blog-10, T-blog-12)

- **Server search:** `listBlogs` passes Elasticsearch `query_string` via `source` param (replaces client-only filter).
- **Pagination:** `BlogListPagination` + page state in `useBlogList`.
- **Access request:** `AccessRequestModal` → `requestBlogMembership` in liveblog-api `endpoints/membership.ts`.
- **WebSocket:** `useBlogListWebSocket` refreshes grid on `LiveblogWsEvent.Blog`.
- Documented in CHANGELOG; see [implementation report](../../reports/implementation/2026-05-27-blogging-rich-text.md).

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `client/app/scripts/liveblog-bloglist`
