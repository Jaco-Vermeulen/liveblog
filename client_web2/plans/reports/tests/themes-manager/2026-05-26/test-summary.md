# Themes Manager — Test Summary

**Date:** 2026-05-26  
**Mechanism:** `themes-manager`  
**Phase:** 5

## Vitest (Level 1)

| File | Tests | Scope |
|------|-------|-------|
| `services/parseTheme.test.ts` | 2 | Author string parse; `cannotRemoveTheme` / `isSystemTheme` |
| `services/themeHierarchy.test.ts` | 1 | Child nested under `extends` parent |

**Command:** `npm test -- src/mechanisms/themes-manager`

## Smoke (Level 2)

Shared `scripts/smoke-phase5.mjs`:

| Step | Endpoint | Result |
|------|----------|--------|
| Login | `POST /auth_db` | pass |
| Themes list | `GET /themes?max_results=5` | pass (7 total) |

Upload/redeploy/remove not automated in smoke (optional manual on Docker).

## UI smoke (manual)

| Route | Check |
|-------|-------|
| `/themes` | Cards render; make default; download |

## Gaps

- No upload integration test in CI (binary + Docker dependency)
- stylesTab untested until T-theme-9
- E2E modal flow — T-theme-12

## Related

- [Phase 5 rollup](../phase5/2026-05-26/test-summary.md)
- [Implementation report](../../../implementation/2026-05-26-phase5-settings-themes.md)
