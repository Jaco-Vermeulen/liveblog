# Liveblog API — Changelog

## 2026-05-27 - Profile + activity notifications

[ADDED] `endpoints/activity.ts` — `listUserActivity`, `markActivityRead`, unread helpers.
[ADDED] `endpoints/users.ts` — `updateUser`, `changeUserPassword`.
[CHANGED] `types.ts` — `ActivityNotification`, `UserProfileUpdate`, extended `LiveblogUser`.

## 2026-05-26 - Blog PATCH fix

[ADDED] `updateBlog(blog, patch)` — PATCH only supplied fields plus `original_creator`/`title`; avoids Eve metadata rejection (`_etag`, `_created`, etc.).
[CHANGED] `updateBlogStatus` delegates to `updateBlog`.
[ADDED] `endpoints/blogs.test.ts` — `updateBlog` body assertion.

## 2026-05-26 - Phase 6 secondary modules

[ADDED] `endpoints/analytics.ts`, `freetypes.ts`, `advertising.ts`, `marketplace.ts`, `syndication.ts`. tasks: T-api-15 through T-api-19
[CHANGED] `types.ts` — BlogAnalyticsRow, Freetype, Advertisement, marketplace/syndication types; EveList `_links`. tasks: T-api-20
[COMPLETED] Phase 6 API layer. tasks: T-api-15 through T-api-20

## 2026-05-26 - Phase 5 settings & themes

[ADDED] `endpoints/settings.ts` — listLanguages, listGlobalPreferences, saveGlobalPreference, instance_settings. tasks: T-api-12
[CHANGED] `endpoints/themes.ts` — uploadTheme, downloadTheme, redeployTheme, removeTheme, setDefaultTheme. tasks: T-api-13
[CHANGED] `client.ts` — FormData body support (theme upload). tasks: T-api-13
[CHANGED] `types.ts` — Theme label/extends/author/blogs; LanguageOption; InstanceSettingsDocument. tasks: T-api-14
[CHANGED] README resource table + File Structure. tasks: T-api-14
[COMPLETED] Phase 5 API layer. tasks: T-api-12 through T-api-14

## 2026-05-26 - Documentation sweep

[CHANGED] README Status, Current Implementation, File Structure, endpoint catalog synced to `src/`
[ADDED] Test report `plans/reports/tests/liveblog-api/2026-05-26/`
[CHANGED] Technical Specification — explicit Phase 4 endpoint exports
[ADDED] Cross-link to `plans/reports/implementation/2026-05-26-phase4-editor-subsystems.md`
[MILESTONE] Phases 1–4 API layer documentation — 100%

## 2026-05-26 - Phase 4 editor resources

[ADDED] `endpoints/polls.ts`, `outputs.ts`, `consumers.ts`, `collections.ts`, `users.ts`
[COMPLETED] T-api-11 (editor-manager Phase 4)

## 2026-05-26 - Phase 3 posts layer

[ADDED] `endpoints/posts.ts`, `postsCriteria.ts`, `postsTypes.ts` — list, create items, save post, enrich
[ADDED] Vitest `posts.test.ts`, `postsCriteria.test.ts`
[COMPLETED] T-api-10 (editor-manager Phase 3)

## 2026-05-26 - Phase 2 blogs layer

[ADDED] `endpoints/blogs.ts` — list, create, update status, delete
[ADDED] `endpoints/themes.ts`, `endpoints/archive.ts`, `endpoints/blogslist.ts`
[ADDED] Blog/Theme types in `types.ts`; Vitest `blogs.test.ts`
[COMPLETED] T-api-9 (blogs/themes); posts deferred T-api-10

## 2026-05-25 - Plan Created

[ADDED] Mechanism plan with README, TASKS, CHANGELOG, COMMENTS
[ADDED] Listed in client_web2/plans/README.md mechanism index

## 2026-05-25 - Planner: README elaboration

[CHANGED] README expanded to full MECHANISM_README_STANDARD compliance
[ADDED] Technical Specification, File Structure (ASCII tree), Components, Testing Requirements

## 2026-05-26 - Phase 1 implementation

[ADDED] `src/mechanisms/liveblog-api/` — `apiRequest`, `api` client, `LiveblogApiError`, auth endpoints. tasks: T-api-2, T-api-3, T-api-4
[ADDED] `setOnUnauthorized` hook for auth-manager session expiry. tasks: T-api-5
[ADDED] Vitest client tests; Docker smoke `POST /auth_db` → 201. tasks: T-api-6, T-api-7
[COMPLETED] Phase 1 auth HTTP layer. tasks: T-api-8
