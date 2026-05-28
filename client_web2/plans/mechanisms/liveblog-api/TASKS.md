# Liveblog API — Tasks

## Phase 1

- [x] (T-api-1) Review legacy module: `superdesk-core/scripts/core/api`
- [x] (T-api-2) Create `src/mechanisms/liveblog-api/` scaffold
- [x] (T-api-3) Implement `apiRequest`, `api` client, `LiveblogApiError`
- [x] (T-api-4) Implement `endpoints/auth.ts` (login, getUser, logout)
- [x] (T-api-5) `setOnUnauthorized` hook for auth-manager
- [x] (T-api-6) Unit tests (Vitest)
- [x] (T-api-7) Smoke test Docker `POST /auth_db` 201
- [x] (T-api-8) Update CHANGELOG + COMMENTS + README

## Phase 2+

- [x] (T-api-9) `endpoints/blogs.ts`, `themes.ts`, `archive.ts`, `blogslist.ts`
- [x] (T-api-10) `endpoints/posts.ts` (editor-manager Phase 3)
- [x] (T-api-11) `endpoints/polls.ts`, `outputs.ts`, `consumers.ts`, `collections.ts`, `users.ts` (editor-manager Phase 4)

## Phase 5

- [x] (T-api-12) `endpoints/settings.ts` — languages, global_preferences, instance_settings
- [x] (T-api-13) Extend `endpoints/themes.ts` — upload, download, redeploy, remove, setDefaultTheme; FormData in `client.ts`
- [x] (T-api-14) Extend `types.ts` — Theme metadata, LanguageOption, InstanceSettingsDocument
- [COMPLETED] Phase 5 API layer for settings + themes. tasks: T-api-12, T-api-13, T-api-14

## Phase 6

- [x] (T-api-15) `endpoints/analytics.ts` — bloganalytics pagination
- [x] (T-api-16) `endpoints/freetypes.ts` — CRUD + usage check
- [x] (T-api-17) `endpoints/advertising.ts` — advertisements + collections
- [x] (T-api-18) `endpoints/marketplace.ts` — blogs, marketers, languages
- [x] (T-api-19) `endpoints/syndication.ts` — producers, consumers, syndication in/out
- [x] (T-api-20) Phase 6 types in `types.ts`
- [COMPLETED] Phase 6 API layer. tasks: T-api-15 through T-api-20
