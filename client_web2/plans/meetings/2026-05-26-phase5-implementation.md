# Meeting — Phase 5 Settings & Themes

**Date:** 2026-05-26  
**Attendees:** Implementation agent (documented post-hoc)  
**Scope:** client_web2 Phase 5

## Decisions

1. **HTTP centralisation** — All settings/themes calls use **liveblog-api** only; no mechanism-local `settingsApi.ts` / `themesApi.ts` wrappers (avoids duplicate layers).
2. **Tags UI** — Native chip input + Enter/Tab instead of `react-select` dependency (smaller bundle; parity with creatable behaviour).
3. **Theme upload** — `FormData` support added to `apiRequest` in liveblog-api `client.ts`.
4. **stylesTab deferral** — Theme list + CRUD actions ship in Phase 5; full `stylesTab` port tracked as Phase 5+ (T-theme-9) to limit scope.
5. **Privilege gates** — Routes visible to authenticated users; `global_preferences` / `themes_delete` UI gates deferred (T-set-9, T-theme-10).
6. **Language field** — Legacy hides language on general settings; web2 matches (not exposed until T-set-10).

## Routes confirmed

- `/settings/general`, `/settings/instance-settings` — sub-nav via existing `settingsSubNav`
- `/themes` — admin tools menu entry unchanged

## Verification

- `npm test` — 45 passed
- `npm run build` — success
- `node scripts/smoke-phase5.mjs` — pass against local Docker :5000

## Follow-up

- Phase 6 secondary modules per plans/README
- websocket-manager for live editor (T-edit-13)
- Theme settings modal when stylesTab port begins

## Artifacts

- [Implementation report](../reports/implementation/2026-05-26-phase5-settings-themes.md)
- [Test summary](../reports/tests/phase5/2026-05-26/test-summary.md)
