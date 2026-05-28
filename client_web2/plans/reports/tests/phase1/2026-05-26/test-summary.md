# Phase 1 — Test Summary

**Date:** 2026-05-26  
**Command:** `npm test -- --run` (client_web2 root)

## Results

| Metric | Value |
|--------|-------|
| Test files | 5 passed |
| Tests | 17 passed |
| Duration | ~3.6s |

## By file

| File | Mechanism / area |
|------|------------------|
| `src/mechanisms/request-logger/logger.test.ts` | request-logger |
| `src/mechanisms/liveblog-api/client.test.ts` | liveblog-api |
| `src/mechanisms/auth-manager/services/sessionStorage.test.ts` | auth-manager |
| `src/mechanisms/navigation-manager/nav-config.test.ts` | navigation-manager |
| `src/components/ui/LbCard.test.tsx` | style-guide |

## Smoke (manual / integration)

| Check | Result |
|-------|--------|
| `POST /api/auth_db` (Docker :5000) | 201 (via liveblog-api) |
| Dev server :9001 | 200 |
| Login → shell | Manual — pending formal smoke sign-off (T-nav-7) |

## Related

- [Implementation report](../../implementation/2026-05-26-phase1-foundation.md)
- [Meeting notes](../../../meetings/2026-05-26-phase1-implementation.md)
