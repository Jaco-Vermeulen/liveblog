# Blog List Manager — Changelog

## 2026-05-27 - List scale + access

[ADDED] Server-side blog search (Elasticsearch `query_string` on title/description). tasks: T-blog-10
[ADDED] `BlogListPagination` — page prev/next. tasks: T-blog-12
[ADDED] `AccessRequestModal` + `requestBlogMembership` API. tasks: T-blog-9
[ADDED] `useBlogListWebSocket` — refresh list on WS `blog` event. tasks: T-ws-10

## 2026-05-26 - Phase 2 implementation

[ADDED] `src/mechanisms/blog-list-manager/` — BlogListPage, grid, toolbar, bulk actions. tasks: T-blog-2, T-blog-4
[ADDED] `useBlogList`, `useBlogActions`, `useBlogPermissions` hooks. tasks: T-blog-3
[ADDED] CreateBlogModal (title, description, cover upload, theme). tasks: T-blog-4
[ADDED] EmbedCodeModal via liveblog-api blogslist. tasks: T-blog-4
[ADDED] Vitest: constants, blogPermissions. tasks: T-blog-6
[ADDED] Smoke: `scripts/smoke-blogs.mjs`. tasks: T-blog-7
[CHANGED] `/liveblog/*` routes use `BlogListPage` instead of SetupPage stub. tasks: T-blog-5
[COMPLETED] Phase 2 blog list. tasks: T-blog-1, T-blog-8
[NOTE] Search uses client-side filter until server ES query validated on Docker (T-blog-10)

## 2026-05-26 - Documentation sweep

[CHANGED] README File Structure aligned to implemented tree
[ADDED] Test report `plans/reports/tests/blog-list-manager/2026-05-26/`

## 2026-05-25 - Plan Created

[ADDED] Mechanism plan with README, TASKS, CHANGELOG, COMMENTS
[ADDED] Listed in client_web2/plans/README.md mechanism index

## 2026-05-25 - Planner: README elaboration

[CHANGED] README expanded to full MECHANISM_README_STANDARD compliance
[ADDED] Technical Specification, File Structure (ASCII tree), Components, Testing Requirements
