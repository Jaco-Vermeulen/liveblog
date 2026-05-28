# Liveblog API — Comments

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `superdesk-core/scripts/core/api`

## 2026-05-26 — Phase 1

Core client implemented. All fetch goes through `apiRequest` with request-logger. Dev uses relative `/api/...` paths for Vite proxy.

## 2026-05-26 — Phase 2

Blogs, themes, archive, blogslist endpoints shipped for blog-list-manager. tasks: T-api-9

## 2026-05-26 — Phase 3

Posts layer: `posts.ts`, `postsCriteria.ts`, `postsTypes.ts` — nested `GET /blogs/:id/posts` with legacy filter parity. tasks: T-api-10

## 2026-05-26 — Phase 4

Editor settings/composer support: `polls.ts`, `outputs.ts`, `consumers.ts`, `collections.ts`, `users.ts`. tasks: T-api-11

## 2026-05-26 — Documentation sweep

README Status and File Structure updated to match `src/mechanisms/liveblog-api/`. Test report: `plans/reports/tests/liveblog-api/2026-05-26/`.

**Phase 4 poll save:** `savePostWithItems` delegates `item_type === 'poll'` to `savePollForPost`; on update merges existing `poll_body.answers[].votes` (legacy `posts.service.ts` parity). All calls logged via `apiRequest` → request-logger.

**Documentation index:** mechanism four-file set + `plans/CHANGELOG.md` T-api-11 + Phase 4 implementation report.

## 2026-05-26 — Phase 5

`endpoints/settings.ts` for languages, global_preferences, instance_settings. Extended `themes.ts` for upload (FormData), download (blob), redeploy, delete, setDefaultTheme. `GlobalPreference.value` typed as `unknown`. tasks: T-api-12 through T-api-14

**FormData:** `client.ts` must not set `Content-Type: application/json` when body is `FormData` — browser sets multipart boundary.

Smoke: `scripts/smoke-phase5.mjs` exercises settings + themes list endpoints.
