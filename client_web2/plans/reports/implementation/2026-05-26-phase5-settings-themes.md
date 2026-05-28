# Phase 5 — Settings & Themes Implementation Report

**Date:** 2026-05-26  
**Scope:** `client_web2/` settings-manager, themes-manager, liveblog-api Phase 5 endpoints  
**Status:** Complete (stylesTab / theme settings modal deferred)

## Summary

Phase 5 delivers instance-level admin tools after Phases 1–4: **Liveblog Settings** (general preferences + instance JSON) and **Theme Manager** (list, default theme, upload, download, redeploy, remove). All REST I/O flows through **liveblog-api** with **request-logger** on every call.

## Mechanisms completed

| Mechanism | Phase | Status | Source path |
|-----------|-------|--------|-------------|
| settings-manager | 5 | Implemented | `src/mechanisms/settings-manager/` |
| themes-manager | 5 | Implemented (core) | `src/mechanisms/themes-manager/` |
| liveblog-api (settings + themes) | 5 | Implemented | `endpoints/settings.ts`, extended `themes.ts` |

## Routes wired

| Path | Component | Nav |
|------|-----------|-----|
| `/settings` | redirect → `/settings/general` | Admin → Liveblog-instellings |
| `/settings/general` | `GeneralSettingsPage` | Sub-nav: Algemeen |
| `/settings/instance-settings` | `InstanceSettingsPage` | Sub-nav: Instansie-instellings |
| `/themes` | `ThemesManagerPage` | Admin → Temabestuur |

## API endpoints added (liveblog-api)

| Module | Functions | Server paths |
|--------|-----------|--------------|
| `settings.ts` | `listLanguages`, `listGlobalPreferences`, `saveGlobalPreference`, `getInstanceSettingsDocument`, `saveInstanceSettings` | `/languages`, `/global_preferences`, `/instance_settings` |
| `themes.ts` (extended) | `uploadTheme`, `downloadTheme`, `redeployTheme`, `removeTheme`, `setDefaultTheme`, `getDefaultThemePreference` | `/theme-upload`, `/theme-download/:name`, `/theme-redeploy/:name`, `/themes/:id` |

`client.ts` updated: `FormData` bodies skip JSON `Content-Type` (theme upload).

## General settings parity (legacy)

| Key | Web2 UI |
|-----|---------|
| `theme` | Default theme `<select>` |
| `global_tags` | `TagsManager` |
| `allow_multiple_tag_selection` | Checkbox |
| `youtube_privacy_status` | Select |
| `embed_height_responsive_default` | Checkbox |
| `editor_quotation_marks_language` | Select |
| `language` | Not exposed (hidden in legacy `general.ng1`) |

## Themes parity (legacy)

| Feature | Web2 | Notes |
|---------|------|-------|
| Theme list | `ThemesManagerPage` + `ThemeCard` | Card grid |
| Default theme | `setDefaultTheme` | Via `global_preferences` |
| Upload | Hidden file input + `uploadTheme` | `.zip` |
| Download | `downloadTheme` | Blob + anchor |
| Redeploy | `redeployTheme` | GET, auth header |
| Remove | `removeTheme` | System themes + children guarded |
| Blogs modal | `ThemeBlogsModal` | Title list only (iframe T-theme-11) |
| Hierarchy | `getHierarchyFromThemes` | Built; flat grid in UI |
| stylesTab / settings modal | — | Phase 5+ T-theme-9 |

## Tests

- **Vitest:** 45 tests, 19 files — [phase5 test-summary](../tests/phase5/2026-05-26/test-summary.md)
- **Smoke:** `node scripts/smoke-phase5.mjs` — login, themes, global_preferences, instance_settings, languages

## Known gaps

| Item | Tracking |
|------|----------|
| Theme settings modal + stylesTab | T-theme-9 |
| `global_preferences` privilege UI gate | T-set-9, T-theme-10 |
| Language selector on general settings | T-set-10 |
| Theme blog iframe previews | T-theme-11 |
| E2E Playwright | T-set-11, T-theme-12 |

## Documentation updated (2026-05-26 sweep)

- Mechanism README / TASKS / CHANGELOG / COMMENTS (settings-manager, themes-manager, liveblog-api)
- `plans/COMPONENT_INVENTORY.md`, `plans/CHANGELOG.md`, `plans/KNOWLEDGE_GRAPH.md`, `plans/TASKS.md`, `plans/README.md`
- Per-mechanism test reports under `plans/reports/tests/`
- Meeting notes: [2026-05-26-phase5-implementation.md](../../meetings/2026-05-26-phase5-implementation.md)

## Next phase

**Phase 6** — analytics, syndication, marketplace, advertising, freetypes per [plans/README.md](../../README.md#implementation-phases). **websocket-manager** remains parallel priority for live editor updates.
