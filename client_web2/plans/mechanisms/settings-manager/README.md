# Settings Manager

Global and instance Liveblog settings for the admin client. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Ports legacy `liveblog-settings`: **General Settings** (language, theme, tags, YouTube privacy, embed defaults, quotation marks) and **Instance Settings** (JSON document edited in Ace). Two Superdesk settings activities under `/settings/`.

## Status

**Phase 5 implemented (2026-05-26)** — General + instance settings pages at `/settings/general` and `/settings/instance-settings`. All HTTP via **liveblog-api** + **request-logger**. **Phase 5+ (2026-05-26):** `InstanceFeaturesProvider` reloads subscription feature flags on WebSocket `instance_settings:updated` (T-set-12 / T-ws-9).

## Purpose

- Render settings shell at `/settings/` with navigation to General and Instance sub-pages
- **General Settings** (`/settings/general`): load/save `global_preferences` keys; theme/language dropdowns from `themes` and `languages` APIs
- **Instance Settings** (`/settings/instance-settings`): load/save `instance_settings` as formatted JSON (Ace-equivalent editor in React)
- Tags manager for `global_tags` (creatable multi-select; parity with legacy `tagsManager.tsx`)
- Dirty-form handling, save notifications, and close → `/liveblog/`
- Enforce `global_preferences` privilege on routes and actions

## Current Implementation

- **Legacy:** `client/app/scripts/liveblog-settings` — `LiveblogSettingsController`, `LiveblogInstanceSettingsController`, `aceEditor` directive, `renderTagsComponent`, `lbSettingsView`
- **Web2:** `src/mechanisms/settings-manager/` — `GeneralSettingsPage`, `InstanceSettingsPage`, hooks, TagsManager, JsonEditor

## Liveblog server / API

| Resource | Methods | Usage |
|----------|---------|--------|
| `themes` | `GET` query | Theme dropdown; filter items with `label` defined |
| `languages` | `GET` query | Language dropdown |
| `global_preferences` | `GET` query, `PATCH`/`save` per key | General settings read/write |
| `instance_settings` | `GET` query, `POST`/`save` | Instance JSON blob (`settings` object) |

**General settings keys** (from legacy `allowedKeys`):

- `language`, `theme`, `global_tags`, `allow_multiple_tag_selection`, `youtube_privacy_status`, `embed_height_responsive_default`, `editor_quotation_marks_language`

**Routes (React Router — match legacy Superdesk activities):**

| Path | Label | Notes |
|------|-------|--------|
| `/settings/` | Liveblog Settings | Parent; privilege `global_preferences` |
| `/settings/general` | General Settings | Form + tags |
| `/settings/instance-settings` | Instance Settings | JSON editor; `liveblogSupportTools` in legacy |

## Dependencies

- **liveblog-api** (REQUIRED)
- **request-logger** (REQUIRED)
- **auth-manager** (REQUIRED) — session + `global_preferences` privilege
- **navigation-manager** — settings submenu placement
- **websocket-manager** — `instance_settings:updated` pushes feature-flag refresh
- **style-guide** (REQUIRED) — forms, selects, buttons, layout

## Dependents

- **themes-manager** — shares `themes` / `global_preferences` for default theme
- **editor-manager** — reads global preferences affecting editor behaviour
- **navigation-manager** — admin tools menu entries

## Technical Specification

```typescript
interface GlobalPreference<T = unknown> {
  _id?: string;
  key: string;
  value: T;
  etag?: string;
}

interface LiveblogGeneralSettings {
  language: GlobalPreference<string>;
  theme: GlobalPreference<string>;
  global_tags: GlobalPreference<string[]>;
  allow_multiple_tag_selection: GlobalPreference<boolean>;
  youtube_privacy_status: GlobalPreference<'private' | 'public' | 'unlisted'>;
  embed_height_responsive_default: GlobalPreference<boolean>;
  editor_quotation_marks_language: GlobalPreference<'af' | 'en' | 'de'>;
}

interface InstanceSettingsDocument {
  settings: Record<string, unknown>;
}

interface LanguageOption {
  _id: string;
  name: string;
  label?: string;
}

interface ThemeOption {
  name: string;
  label: string;
}

interface SettingsManagerApi {
  getLanguages(): Promise<LanguageOption[]>;
  getThemesForSettings(): Promise<ThemeOption[]>;
  getGlobalPreferences(): Promise<GlobalPreference[]>;
  saveGlobalPreference(item: GlobalPreference, patch: { key: string; value: unknown }): Promise<GlobalPreference>;
  getInstanceSettings(): Promise<InstanceSettingsDocument>;
  saveInstanceSettings(settings: Record<string, unknown>): Promise<void>;
}

// Hooks
function useGeneralSettings(): {
  settings: LiveblogGeneralSettings;
  languages: LanguageOption[];
  themes: ThemeOption[];
  loading: boolean;
  isDirty: boolean;
  setTags(tags: string[]): void;
  save(): Promise<void>;
};

function useInstanceSettings(): {
  jsonText: string;
  setJsonText(text: string): void;
  loading: boolean;
  isDirty: boolean;
  save(): Promise<void>;
  formatJson(): void;
};
```

**Behaviour:**

- On general save: batch `saveGlobalPreference` for each allowed key (legacy uses `$q.all`)
- Instance save: `JSON.parse` client-side before POST; surface `_issues.settings` or `_message` from API
- Tags change marks form dirty without auto-save
- Close navigates to `/liveblog/`

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/settings-manager/
├── index.ts                      # Public exports (pages, hooks, constants)
├── constants.ts                  # SETTINGS_KEYS, privacy/quotation options
├── types.ts                      # GeneralSettingsForm, mapPreferencesToForm
├── types.test.ts                 # Vitest — preference mapping
├── hooks/
│   ├── useGeneralSettings.ts     # Load/save general preferences
│   └── useInstanceSettings.ts    # Load/save instance JSON
└── components/
    ├── GeneralSettingsPage.tsx   # /settings/general
    ├── InstanceSettingsPage.tsx  # /settings/instance-settings
    ├── SettingsToolbar.tsx       # Save + cancel → /liveblog
    ├── TagsManager.tsx           # Multi-tag input (Enter/Tab)
    └── JsonEditor.tsx            # Monospace JSON textarea
```

Routes are registered in `src/App.tsx`. Sub-navigation is provided by **navigation-manager** (`settingsSubNav`).

## Design Decisions

- **No raw fetch** — all HTTP via **liveblog-api** + **request-logger**
- **JSON editor:** React code editor with JSON mode (replace global `ace` dependency); format on load like legacy `aceEditor` directive
- **Tags:** Port `CreatableSelect` behaviour; document that renaming tags does not retag existing posts (legacy UX copy)
- **Privilege gate:** Hide routes and disable save without `global_preferences`
- **Instance settings:** Support-tools only in legacy (`liveblogSupportTools`); mirror visibility via config/role in web2

## Implementation Approach

1. Add `settingsApi` endpoints to **liveblog-api** (`themes`, `languages`, `global_preferences`, `instance_settings`)
2. Implement `GeneralSettingsPage` with parity fields and batch save
3. Implement `InstanceSettingsPage` with parse validation and server error display
4. Wire routes in app router; register nav items in **navigation-manager**
5. Level 1–3 tests (see Testing Requirements)

Phase **5** per [plans/README.md](../../README.md#implementation-phases).

## Components

| Component | Location | Purpose | Styling |
|-----------|----------|---------|---------|
| `GeneralSettingsPage` | `components/GeneralSettingsPage.tsx` | General preferences form | `LbFormField`, native `<select>`, `LbAlert`, `LbSpinner` |
| `InstanceSettingsPage` | `components/InstanceSettingsPage.tsx` | Instance JSON page | `JsonEditor`, `SettingsToolbar` |
| `SettingsToolbar` | `components/SettingsToolbar.tsx` | Save / cancel actions | `LbButton` primary + secondary |
| `TagsManager` | `components/TagsManager.tsx` | Global tags chips + input | `LbFormField`, `LbInput` |
| `JsonEditor` | `components/JsonEditor.tsx` | Instance settings JSON | `LbFormField`, monospace `textarea` |

All UI **MUST** use **style-guide** components and tokens — no ad-hoc CSS.

## Usage Examples

```typescript
import { GeneralSettingsPage, useGeneralSettings } from '@/mechanisms/settings-manager';

// Route registration (app router)
{ path: '/settings/general', element: <GeneralSettingsPage /> }

// In a parent layout
const { settings, save, loading } = useGeneralSettings();
await save();
```

## Data Flow

```
GeneralSettingsPage
  → useGeneralSettings
    → liveblog-api: listGlobalPreferences, listThemesForSettings, listLanguages
    → user edits → save → saveGlobalPreference (per allowed key, logged)
InstanceSettingsPage
  → useInstanceSettings
    → liveblog-api: getInstanceSettingsDocument
    → save → JSON.parse → saveInstanceSettings
```

## Error Handling Strategy

- General save failure: toast/error banner “Saving settings failed…”
- Instance invalid JSON: block save, inline editor error (legacy: `Invalid JSON format`)
- Instance API `_issues`: display `settings` issue or `_message` (legacy 10s notify)
- Load failures: error state on page + retry; log via **request-logger**

## Related Mechanisms

- [themes-manager](../themes-manager/README.md) — theme list and default theme
- [liveblog-api](../liveblog-api/README.md) — HTTP client
- [navigation-manager](../navigation-manager/README.md) — menu entries
- [style-guide](../style-guide/README.md) — UI primitives

## Testing Requirements

| Level | Scope |
|-------|--------|
| **1** | Unit: `useGeneralSettings` allowed keys; JSON parse/format for instance |
| **2** | Integration: `GET/POST` `global_preferences`, `instance_settings` against `http://localhost:5000/api` with logging assertions |
| **3** | E2E: navigate `/settings/general`, change language, save; `/settings/instance-settings`, edit JSON, save; verify via API read-back |

Docker stack required for Level 2–3. Dev UI: `http://localhost:9001`.

## Legacy reference

`client/app/scripts/liveblog-settings`

- `module.js` — activities `/settings/`, `/settings/general`, `/settings/instance-settings`; API providers
- `controllers/general-settings.ts` — `LiveblogSettingsController`
- `controllers/instance-settings.ts` — `LiveblogInstanceSettingsController`, Ace JSON
- `components/tagsManager.tsx` — React tags selector
- `directives/lbSettingsView.ts` — settings chrome

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
