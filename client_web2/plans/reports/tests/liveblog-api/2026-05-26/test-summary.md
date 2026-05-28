# liveblog-api — Test Summary

**Date:** 2026-05-26  
**Command:** `npm test` (client_web2 root)

## Vitest (mechanism scope)

| File | Tests | Status |
|------|-------|--------|
| `client.test.ts` | 2 | pass |
| `endpoints/blogs.test.ts` | 1 | pass |
| `endpoints/posts.test.ts` | 2 | pass |
| `endpoints/postsCriteria.test.ts` | 3 | pass |

## Smoke (Docker :5000)

Covered indirectly via mechanism smokes (`smoke-blogs.mjs`, `smoke-editor.mjs`, `smoke-editor-phase4.mjs`) — all use `apiRequest` paths.

| Check | Result |
|-------|--------|
| `POST /auth_db` | pass (Phase 1) |
| `GET /blogs` | pass |
| `GET /blogs/:id/posts` | pass |
| `GET/POST polls, outputs, consumers` | pass (Phase 4 smoke) |

## Phase 5 endpoints

| Module | Smoke (`smoke-phase5.mjs`) |
|--------|----------------------------|
| `settings.ts` | `GET /global_preferences`, `/instance_settings`, `/languages` |
| `themes.ts` (extended) | `GET /themes` — upload/redeploy not in automated smoke |

## Notes

- Full suite rollup: [phase5 test-summary](../../phase5/2026-05-26/test-summary.md)
- Phases 2–4 rollup: [phases-2-4 test-summary](../../phases-2-4/2026-05-26/test-summary.md)
