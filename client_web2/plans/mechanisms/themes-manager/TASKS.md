# Themes Manager — Tasks

## Phase 5

- [x] (T-theme-1) Review legacy module: `client/app/scripts/liveblog-themes`
- [x] (T-theme-2) Create `src/mechanisms/themes-manager/` scaffold
- [x] (T-theme-3) Implement `useThemesManager`, `themeHierarchy`, `parseTheme`
- [x] (T-theme-4) Implement `ThemesManagerPage`, `ThemeCard`, `ThemeBlogsModal`
- [x] (T-theme-5) Wire `/themes` route in `App.tsx`
- [x] (T-theme-6) Unit tests (Vitest `themeHierarchy.test.ts`, `parseTheme.test.ts`)
- [x] (T-theme-7) Smoke test against Docker stack (`scripts/smoke-phase5.mjs`)
- [x] (T-theme-8) Update CHANGELOG + COMMENTS + README
- [COMPLETED] Phase 5 themes-manager (list + actions). tasks: T-theme-1 through T-theme-8
[MILESTONE] 100% (core list; stylesTab deferred)

## Phase 5+

- [x] (T-theme-9) Port `stylesTab` + `ThemeSettingsModal`
- [x] (T-theme-10) `themes_delete` privilege gate in UI
- [ ] (T-theme-11) Blog iframe preview in `ThemeBlogsModal` (public URL helper)
- [x] (T-theme-12) E2E: upload theme, set default, open settings modal
