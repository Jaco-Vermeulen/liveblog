# Themes Manager

Theme list, upload, download, redeploy, default theme, and per-theme style editor. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Ports legacy `liveblog-themes` **Theme Manager** at `/themes/`: hierarchical theme list, blog usage counts, theme file upload, download/redeploy, set global default theme, and theme settings modal with **stylesTab** React component for style options (colors, fonts, groups).

## Status

**Phase 5+ (2026-05-26)** — Theme Manager at `/themes`: list, default theme, upload/download/redeploy, remove, and **Theme Settings** modal (Instellings + Style tabs, `stylesTab` port).

## Purpose

- Theme Manager page at `/themes/` (admin tools; `global_preferences` privilege)
- List themes with hierarchy (`extends`), blog counts, screenshots, author metadata
- Upload theme archive via `theme-upload`; download via `theme-download`; redeploy via `theme-redeploy`
- Set default theme via `global_preferences` key `theme`
- Remove theme (respect system themes, children, `themes_delete` privilege)
- Theme settings modal: port **stylesTab** (React) — style groups, color/font/dropdown inputs, Google Fonts when API key present
- Feature limits: `custom_themes` feature flag and upgrade modal parity

## Current Implementation

- **Legacy:** `client/app/scripts/liveblog-themes` — `LiveblogThemesController`, `themesService`, `stylesTab/` React island, `theme-settings-modal.ts`
- **Web2:** `src/mechanisms/themes-manager/` — `ThemesManagerPage`, `ThemeCard`, `useThemesManager`, hierarchy + parse services

## Liveblog server / API

| Resource / path | Methods | Usage |
|-----------------|---------|--------|
| `themes` | `GET` query, `DELETE` remove | List themes, delete theme |
| `global_preferences` | `GET` query (`key: theme`), `save` | Default theme |
| `blogs` | `GET` query (ES match on `blog_preferences.theme`) | Blogs using theme |
| `theme-upload` | `POST` multipart | Upload theme file (URL derived from themes href) |
| `theme-download/{name}` | `GET` | Download theme archive |
| `theme-redeploy/{name}` | `GET` | Redeploy theme assets |

**Route:**

| Path | Label |
|------|-------|
| `/themes/` | Theme Manager |

**Privileges:** `global_preferences` (page); `themes_delete` (remove).

## Dependencies

- **liveblog-api** (REQUIRED)
- **request-logger** (REQUIRED)
- **auth-manager** (REQUIRED) — session token for redeploy/upload headers
- **settings-manager** — shared `global_preferences` / `themes` concepts
- **style-guide** (REQUIRED) — list UI, modals, buttons
- **blog-list-manager** or shared blog URL helper — public blog preview URLs (legacy `blogService.getPublicUrl`)

## Dependents

- **settings-manager** — theme dropdown in general settings
- **editor-manager** — per-blog theme selection uses theme metadata/options

## Technical Specification

```typescript
interface ThemeAuthor {
  name?: string;
  email?: string;
  url?: string;
}

interface ThemeBlogSummary {
  _id: string;
  title: string;
  iframe_url?: string;
}

interface LiveblogTheme {
  _id: string;
  name: string;
  label?: string;
  extends?: string;
  author?: ThemeAuthor | string;
  screenshot_url?: string;
  blogs_count?: number;
  blogs?: ThemeBlogSummary[];
  blogs_data?: { total: number; _items: ThemeBlogSummary[] };
  options?: ThemeStyleOption[];
  settings?: Record<string, unknown>;
}

interface ThemeStyleOption {
  name: string;
  type: 'checkbox' | 'select' | 'text' | 'colorpicker';
  default?: unknown;
  label?: string;
}

interface StyleGroup {
  name: string;
  options: ThemeStyleOption[];
}

interface IStylesTabProps {
  defaultSettings: Record<string, unknown>;
  settings: Record<string, unknown>;
  styleOptions: StyleGroup[];
  fontsOptions?: { value: string; label: string }[];
  googleApiKey?: string;
  onStoreChange: () => void;
}

interface ThemesManagerApi {
  listThemes(): Promise<LiveblogTheme[]>;
  getDefaultThemePreference(): Promise<GlobalPreference<string> | null>;
  setDefaultTheme(themeName: string, existing?: GlobalPreference<string>): Promise<void>;
  uploadTheme(file: File): Promise<void>;
  downloadTheme(name: string): void;
  redeployTheme(name: string): Promise<void>;
  removeTheme(theme: LiveblogTheme): Promise<void>;
  getThemeHierarchy(themes: LiveblogTheme[]): Record<string, unknown>;
}

// Hooks
function useThemesManager(): {
  themes: LiveblogTheme[];
  hierarchy: Record<string, unknown>;
  globalTheme: GlobalPreference<string> | null;
  loading: boolean;
  refresh(): Promise<void>;
};
```

**System themes** (cannot remove): `angular`, `classic`, `default`, `amp`, `simple`. Exclude `angular` from theme name pickers. **stylesTab** calls `onStoreChange` when settings hash changes; loads Google Fonts when `googleApiKey` set.

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/themes-manager/
├── index.ts                      # Public exports
├── constants.ts                  # SYSTEM_THEMES, HIDDEN_THEME_PICKER
├── hooks/
│   └── useThemesManager.ts       # List, actions, default theme state
├── services/
│   ├── themeHierarchy.ts         # getHierarchyFromThemes (legacy port)
│   ├── themeHierarchy.test.ts
│   ├── parseTheme.ts             # Author parse, enrichThemeFromApi, guards
│   └── parseTheme.test.ts
└── components/
    ├── ThemesManagerPage.tsx     # /themes — grid + upload
    ├── ThemeCard.tsx             # Per-theme actions
    └── ThemeBlogsModal.tsx       # Blogs using theme (title list)
```

**Phase 5+ (planned):** `ThemeSettingsModal.tsx`, `stylesTab/` subtree — see [TASKS.md](TASKS.md) T-theme-9.

HTTP for themes lives in **liveblog-api** `endpoints/themes.ts` and `endpoints/settings.ts` (default theme preference).

## Design Decisions

- **URL transforms:** Legacy replaces `/themes` with `/theme-upload`, `/theme-download/{name}`, `/theme-redeploy/{name}` on API base URL — centralise in **liveblog-api**
- **stylesTab:** Keep as React subtree inside mechanism (already React in legacy); wire `onStoreChange` to persist theme `settings` via API when modal saves
- **Hierarchy:** Port `getHierachyFromThemesCollection` algorithm for tree display
- **No raw `$http` in web2** except through logged client; redeploy uses auth header from **auth-manager**
- **Pagination:** Legacy TODO on blogs list — document same limitation until server supports it

## Implementation Approach

1. Implement `themesApi` + `useThemesManager` with list/load hierarchy
2. Build `ThemesManagerPage` with upload, download, redeploy, make default, remove
3. Port `stylesTab` components; integrate in `ThemeSettingsModal`
4. Connect `global_preferences` default theme indicator
5. Tests per Testing Requirements

Phase **5** per [plans/README.md](../../README.md#implementation-phases).

## Components

| Component | Location | Purpose | Styling |
|-----------|----------|---------|---------|
| `ThemesManagerPage` | `components/ThemesManagerPage.tsx` | Theme Manager list + upload | `LbContentContainer`, `LbButton`, `LbAlert` |
| `ThemeCard` | `components/ThemeCard.tsx` | Per-theme actions | `LbCard`, `LbBadge`, `LbButton` |
| `ThemeBlogsModal` | `components/ThemeBlogsModal.tsx` | Blogs using theme | `LbModal` (title list; iframe Phase 5+) |
| `ThemeSettingsModal` | *planned* | Edit theme settings | embeds `StylesTab` — T-theme-9 |
| `StylesTab` | *planned* | Style options editor | legacy parity — T-theme-9 |

## Usage Examples

```typescript
import { ThemesManagerPage } from '@/mechanisms/themes-manager';

{ path: '/themes', element: <ThemesManagerPage /> }

// stylesTab inside modal
<StylesTab
  defaultSettings={theme.settings}
  settings={draftSettings}
  styleOptions={collectedOptions}
  googleApiKey={import.meta.env.VITE_GOOGLE_FONTS_KEY}
  onStoreChange={() => markDirty()}
/>
```

## Data Flow

```
ThemesManagerPage
  → useThemesManager
    → liveblog-api: listThemes, getDefaultThemePreference
    → enrichThemeFromApi (blogs_count, author parse)
    → getHierarchyFromThemes (display grouping; flat card grid in UI)
  → upload → uploadTheme (FormData) → refresh
  → makeDefault → setDefaultTheme → global_preferences
  → download → downloadTheme (blob + anchor)
  → redeploy → redeployTheme (GET, logged)
  → remove → removeTheme (DELETE with etag)
```

## Error Handling Strategy

- Upload failure: show `_message` or `_error` from API (legacy notify)
- Remove failure: display `error.data.error`; refresh list
- Redeploy: success toast; network errors logged
- stylesTab: warn if Google API key missing (legacy `console.warn`)

## Related Mechanisms

- [settings-manager](../settings-manager/README.md)
- [liveblog-api](../liveblog-api/README.md)
- [style-guide](../style-guide/README.md)

## Testing Requirements

| Level | Scope |
|-------|--------|
| **1** | Unit: hierarchy builder; `parseTheme` author string; system theme guard |
| **2** | API: `GET themes`, `GET global_preferences?key=theme`; optional upload against Docker |
| **3** | E2E: open `/themes/`, list loads; set default theme; open settings modal, change color, save |

## Legacy reference

`client/app/scripts/liveblog-themes`

- `module.js` — `/themes/` activity, `LiveblogThemesController`
- `themes.services.js` — `themesService.get`, `collectOptions`, hierarchy
- `components/stylesTab/` — `StylesTab`, `renderStylesTab`, elements (colorpicker, fontpicker, dropdown)
- `theme-settings-modal.ts` — modal host for styles tab
- `theme-utils.ts`, `directives.js`

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
