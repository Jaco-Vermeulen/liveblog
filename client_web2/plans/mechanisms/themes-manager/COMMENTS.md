# Themes Manager — Comments

## 2026-05-26 — Phase 5

List page with make-default, upload, download, redeploy, remove, blogs modal. tasks: T-theme-1 through T-theme-8

**API:** All HTTP via **liveblog-api** `endpoints/themes.ts` + `saveGlobalPreference` for default theme.

**Hierarchy:** `getHierarchyFromThemes` ported from legacy; UI uses flat card grid (hierarchy available for future tree view).

**stylesTab:** Ported in T-theme-9 — `ThemeSettingsModal` + `components/stylesTab/` on `/themes` → **Instellings** per theme card. Google Fonts via `VITE_GOOGLE_FONTS_KEY`; `theme_styles` feature flag gates Styles tab.

**Blogs modal:** Title list only; legacy loads `iframe_url` per blog via `blogService.getPublicUrl` — T-theme-11.

**Privileges:** `themes_delete` not checked in UI (T-theme-10); system theme + children guards implemented in `cannotRemoveTheme`.

**Tests:** `parseTheme.test.ts`, `themeHierarchy.test.ts`. Reports: `plans/reports/tests/themes-manager/2026-05-26/`.

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `client/app/scripts/liveblog-themes`
