# blog-list-manager — Test Summary

**Date:** 2026-05-26  
**Command:** `npm test` (client_web2 root)

## Vitest (mechanism scope)

| File | Tests | Status |
|------|-------|--------|
| `constants.test.ts` | 3 | pass |
| `services/blogPermissions.test.ts` | 3 | pass |

## Smoke (Docker :5000)

| Script | Result |
|--------|--------|
| `node client_web2/scripts/smoke-blogs.mjs` | pass — login, list open blogs |

## Notes

- UI routes: `/liveblog`, `/liveblog/active`, `/liveblog/archived`, `/liveblog/deleted`
- Full suite rollup: [phases-2-4 test-summary](../../phases-2-4/2026-05-26/test-summary.md)
