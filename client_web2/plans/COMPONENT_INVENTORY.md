# client_web2 — React component inventory

**Updated:** 2026-05-26 (websocket-manager Phase 1)

Reusable components only — feature pages live under `src/mechanisms/<name>/` and `src/app/pages/`.

## Layout (`@/components/layout`)

| Component | Purpose |
|-----------|---------|
| `LbAppShell` | Shell composer (top bar + side nav + main) |
| `LbTopBar` | Fixed 4rem header |
| `LbSideNav` | Teal side panel (16rem) |
| `LbSideNavGroup` | Nav section with optional title |
| `LbSideNavLink` | Side nav item (NavLink) |
| `LbSubNav` | Horizontal tab sub-nav |
| `LbSubNavLink` | Sub-nav tab |
| `LbShellMain` | Main outlet area (offsets) |
| `LbHamburger` | Mobile menu toggle |
| `LbNavBackdrop` | Mobile drawer overlay |
| `LbContentContainer` | Centered page width wrapper |
| `LbPageHeader` | Page title block |
| `LbAppHeader` | Simple header (legacy/setup) |
| `LbFullscreenShell` | Full viewport (login) |
| `LbSplitLayout` | Brand + main split |
| `LbBrandPanel` / `LbBrand*` | Login brand column |
| `LbMainPanel` | Login form column |

## UI primitives (`@/components/ui`)

| Component | Purpose |
|-----------|---------|
| `LbButton` | primary / secondary / ghost / accent |
| `LbCard` + compound | Card, header, title, subtitle, body, footer, meta |
| `LbFeatureCard` | Icon feature tile |
| `LbPanelCard` | Header + body panel |
| `LbAuthCard` | Login card |
| `LbAuthForm` | Login form spacing |
| `LbInput` | Text input |
| `LbFormField` | Label + control |
| `LbBadge` | Status chip |
| `LbAlert` | Error / warning / info banner |
| `LbSpinner` | Loading dots |
| `LbLoadingScreen` | Full-page loader |
| `LbModal` | Dialog |

## Mechanisms (feature UI)

### navigation-manager

| Export | Purpose |
|--------|---------|
| `AppShell` | Authenticated shell + outlet + `ConnectionBanner` |
| `NavMenu`, `ShellSubNav`, `UserMenu` | Nav chrome |
| `nav-config` | Routes, titles, sub-nav rules |

### websocket-manager (Phase 1)

| Export | Purpose |
|--------|---------|
| `WebSocketProvider` | Auth-gated `wsManager` lifecycle |
| `useWebSocket` | Connection state (`useSyncExternalStore`) |
| `useWsEvent` | Typed event subscription |
| `ConnectionBanner` | Disconnect/reconnect `LbAlert` (in AppShell) |
| `wsManager` | Singleton subscribe/connect (non-React) |
| `LiveblogWsEvent` | Event name enum (legacy `EventNames`) |

### auth-manager

| Export | Purpose |
|--------|---------|
| `LoginPage` | `/login` |
| `ProtectedRoute` | Session gate |
| `useAuth` | Session context |

### blog-list-manager (Phase 2)

| Component | Purpose |
|-----------|---------|
| `BlogListPage` | `/liveblog/*` tabs |
| `BlogGrid`, `BlogCard` | Card grid |
| `BlogListToolbar` | Search, create, embed |
| `BulkActionBar` | Multi-select actions |
| `CreateBlogModal` | New blog |
| `EmbedCodeModal` | Blogslist iframe |

### editor-manager (Phases 3–4)

| Component | Purpose |
|-----------|---------|
| `EditorPage` | `/liveblog/edit/:id` |
| `SettingsPage` | `/liveblog/settings/:id` |
| `EditorLayout` | Editor chrome + rail + view modes |
| `EditorViewModeSwitch` | Write / split / preview toggle |
| `BlogLivePreviewPane` | Live draft preview (device widths) |
| `PreviewPostItem`, `PollPreviewBlock` | Reader-style block render |
| `PostComposer` | Rich text (Text/Quote), Image, Embed, Poll; freetype mode; schedule |
| `RichTextBlockEditor` | Maroela-style formatting toolbar (`contentEditable`) |
| `Timeline`, `PostCard` | Post timeline |
| `SettingsRail` | Settings tabs shell |
| `GeneralSettings`, `MembersSettings` | Blog metadata / team |
| `OutputsTab`, `ConsumersList` | Outputs + consumers |
| `OutputModal`, `OutputEmbedCodeModal` | Output CRUD |
| `EmbedPreview`, `PollBlockEditor` | Composer subsystems |
| `FreetypeFields` | Post type + freetype template fields (freetypes-manager) |
| `useEditorWebSocket` | Live `posts` / `blog` / embed / timeline WS (debounced) |

**Subsystem plan docs:** `plans/mechanisms/editor-manager/subsystems/*/README.md`

### user-manager

| Component | Purpose |
|-----------|---------|
| `UsersManagerPage` | `/users` — search, list, create/edit |
| `UserEditModal` | Create/edit user form |
| `useUsersManager` | List, CRUD, roles load |

### settings-manager (Phase 5)

| Component | Purpose |
|-----------|---------|
| `GeneralSettingsPage` | `/settings/general` — global preferences |
| `InstanceSettingsPage` | `/settings/instance-settings` — JSON blob |
| `SettingsToolbar` | Save / cancel → `/liveblog` |
| `TagsManager` | Global tags chips + input |
| `JsonEditor` | Instance settings monospace editor |
| `useGeneralSettings` | Load/save general prefs |
| `useInstanceSettings` | Load/save instance JSON |

### themes-manager (Phase 5)

| Component | Purpose |
|-----------|---------|
| `ThemesManagerPage` | `/themes` — grid + upload |
| `ThemeCard` | Per-theme actions |
| `ThemeBlogsModal` | Blogs using theme |
| `useThemesManager` | List, default theme, actions |
| `getHierarchyFromThemes` | Legacy hierarchy builder |
| `parseThemeAuthor` / `cannotRemoveTheme` | Theme enrichment + guards |

### Foundation (no feature UI)

| Mechanism | Role |
|-----------|------|
| `request-logger` | `logger` |
| `liveblog-api` | `api`, `apiRequest`, endpoints (incl. `settings.ts`) |

## CSS component classes (`src/index.css`)

| Class prefix | Used by |
|--------------|---------|
| `m-blog-grid`, `m-blog-card` | blog-list-manager |
| `m-portal-editor`, `m-editor-*` | editor-manager |

## Import examples

```tsx
import { LbSideNav, LbSubNav, LbTopBar } from '@/components/layout';
import { LbCard, LbButton, LbAlert } from '@/components/ui';
import { AppShell } from '@/mechanisms/navigation-manager';
import { BlogListPage } from '@/mechanisms/blog-list-manager';
import { EditorPage, SettingsPage } from '@/mechanisms/editor-manager';
import { GeneralSettingsPage, InstanceSettingsPage } from '@/mechanisms/settings-manager';
import { ThemesManagerPage } from '@/mechanisms/themes-manager';
import { WebSocketProvider, ConnectionBanner } from '@/mechanisms/websocket-manager';
```
