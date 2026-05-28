# Navigation Manager

App shell, top bar, side navigation, and responsive drawer for Liveblog admin — replacing Superdesk menu and Maroela portal chrome. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Provides the persistent layout wrapper for all authenticated client_web2 routes: top bar with Maroela logo and user menu, side nav with Liveblog sections, mobile hamburger drawer, and a React Router `<Outlet>` for feature pages. Visual parity with legacy `portal.css` shell tokens (`--mar-nav-width`, `--mar-topbar`, 1024px breakpoint).

## Status

**Phase 1 implemented** — `AppShell` with side nav, top bar, mobile drawer, sub-nav (liveblog + settings). Feature pages are placeholders until Phase 2+.

## Purpose

- Render Maroela portal shell (top bar + side nav + main content area)
- Expose navigation links for all Liveblog admin features (main + admin tools)
- Responsive layout: persistent side nav ≥1024px; hamburger drawer + backdrop <1024px
- Host React Router outlet for feature mechanism pages
- Display route title, user menu (profile, sign out), and notifications panel (bell + slide-out, `activity` API)
- Apply `maroela-portal` body/layout tokens via **style-guide**
- Gate shell behind **auth-manager** (authenticated users only)

## Current Implementation

- **Legacy:** `client/app/template/core/menu/views/menu.html` — `#top-menu`, `#main-menu`, `.m-nav-backdrop`, `#side-menu` outlet. Notifications panel: `client/app/template/core/menu/notifications/views/notifications.html`. Shell CSS: `client/app/styles/tailwind/portal.css` (`--mar-nav-width: 16rem`, `--mar-topbar: 4rem`, 1024px drawer breakpoint). Body class `maroela-portal` in `client/app/index.html`. Superdesk menu logic: `superdesk-core/scripts/core/menu`. Afrikaans labels via `langOverride` in `client/superdesk.config.js`.
- **Web2:** `src/mechanisms/navigation-manager/` — `AppShell` composes **style-guide** layout primitives (`LbAppShell`, `LbTopBar`, `LbSideNav`, `LbSubNav`, mobile drawer). `App.tsx` wraps authenticated routes in `ProtectedRoute` → `AppShell` → `<Outlet />`. Feature pages: `LiveblogPage` (stub), `PlaceholderPage` for admin routes. `SetupPage` retained for reference only (not in default route tree).

## Dependencies

- **style-guide** (REQUIRED) — Maroela tokens, layout utilities, `Lb*` components
- **auth-manager** (REQUIRED) — session user for menu, sign-out, protected shell

## Dependents

- **blog-list-manager** — `/liveblog` routes render inside shell outlet
- **editor-manager** — `/liveblog/edit/:id`, `/liveblog/settings/:id` deep links
- **settings-manager**, **themes-manager**, **marketplace-manager**, **syndication-manager**, **advertising-manager**, **freetypes-manager** — admin tool routes

## Technical Specification

### Layout tokens

| Token | CSS variable / value | Usage |
|-------|---------------------|-------|
| Top bar height | `--mar-topbar` / `4rem` | Fixed header |
| Side nav width | `--mar-nav-width` / `16rem` | Drawer and desktop offset |
| Nav breakpoint | `1024px` (`nav`) | Desktop persistent nav vs mobile drawer |
| Page background | `--mar-page` | Main content area |

### Routes (shell wraps all authenticated paths)

| React Router path | Legacy activity | Nav section | Label (Afrikaans override) |
|-------------------|-----------------|-------------|------------------------------|
| `/liveblog` | `/liveblog` | main | Regstreekse blog |
| `/liveblog/active` | `/liveblog/active` | main (tab) | Active |
| `/liveblog/archived` | `/liveblog/archived` | main (tab) | Archived |
| `/liveblog/deleted` | `/liveblog/deleted` | main (tab) | Deleted |
| `/liveblog/edit/:id` | `/liveblog/edit/:_id` | — (deep link) | Blog Editor |
| `/liveblog/settings/:id` | `/liveblog/settings/:_id` | — (deep link) | Blog Settings |
| `/liveblog/analytics/:id` | `/liveblog/analytics/:_id` | — (deep link) | Blog Analytics |
| `/settings` | `/settings` → `/settings/general` | admin | Liveblog Settings |
| `/settings/general` | `/settings/general` | settings submenu | General Settings |
| `/settings/instance-settings` | `/settings/instance-settings` | settings submenu | Instance Settings |
| `/themes` | `/themes` | admin | Temabestuur |
| `/freetypes` | `/freetypes` | admin | Free types manager |
| `/advertising` | `/advertising` | admin | Advertising manager |
| `/marketplace` | `/marketplace` | admin (conditional) | Marketplace |
| `/syndication` | `/syndication` | admin (conditional) | Syndication |
| `/profile` | `/profile/` | user menu | Profile |
| `/` | redirect → `/liveblog` | — | — |

Nav items with `adminTools: true` render in admin section. Marketplace and syndication entries conditional on config flags (Phase 6).

### Core types

```typescript
type NavSection = 'main' | 'admin' | 'settings';

interface NavItem {
  path: string;
  label: string;
  labelAf?: string;
  icon: LucideIcon;
  section: NavSection;
  adminTools?: boolean;
  privileges?: Record<string, number>;
  featureFlag?: 'marketplace' | 'syndication';
  end?: boolean; // NavLink end prop for exact match
}

interface NavConfig {
  main: NavItem[];
  admin: NavItem[];
  settings: NavItem[];
}

interface AppShellContextValue {
  isMobileNavOpen: boolean;
  openMobileNav(): void;
  closeMobileNav(): void;
  toggleMobileNav(): void;
  currentTitle: string;
}

interface AppShellProps {
  children?: React.ReactNode;
}
```

### Hooks and components

```typescript
function AppShell(props: AppShellProps): JSX.Element;
// TopBar + SideNav + MobileDrawer + <Outlet />

function TopBar(): JSX.Element;
// Hamburger (mobile), logo → /liveblog, route title, user/notifications

function SideNav(): JSX.Element;
// Desktop persistent nav ≥1024px; same links as drawer

function MobileDrawer(): JSX.Element;
// Slide-in nav + backdrop <1024px

function useAppShell(): AppShellContextValue;

function useRouteTitle(pathname: string): string;
// Map pathname → display title for top bar

export const NAV_BREAKPOINT = 1024; // px
export const navConfig: NavConfig;
```

### Responsive behaviour

| Viewport | Top bar | Side nav | Main content |
|----------|---------|----------|--------------|
| ≥1024px | Fixed, full width | Always visible, 16rem offset | `margin-left: 16rem`, `padding-top: 4rem` |
| <1024px | Fixed, hamburger visible | Hidden; drawer on toggle | Full width, `padding-top: 4rem`; backdrop when open |

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/navigation-manager/
├── index.ts                      # AppShell, nav-config exports
├── types.ts                      # NavItem, NavSection, sub-nav types
├── nav-config.ts                 # Routes, labels, sub-nav, getRouteTitle
├── nav-config.test.ts            # Vitest
├── context/
│   └── AppShellProvider.tsx      # Mobile drawer open/close state
├── hooks/
│   └── useAppShell.ts            # Shell context consumer
└── components/
    ├── AppShell.tsx              # LbAppShell composer + Outlet
    ├── NavMenu.tsx               # Side nav (LbSideNav + links)
    ├── ShellSubNav.tsx           # Liveblog/settings tab sub-nav
    └── UserMenu.tsx              # Profile + sign out (useAuth)
```

Layout primitives owned by **style-guide** (`src/components/layout/`): `LbAppShell`, `LbTopBar`, `LbSideNav`, `LbSubNav`, `LbHamburger`, `LbNavBackdrop`, `LbShellMain`.

## Design Decisions

- **1024px breakpoint** — matches legacy `portal.css` and `--mar-nav-width`; Tailwind `lg:` (1024px) used for nav visibility
- **nav-config.ts single source** — all menu items defined once; SideNav and MobileDrawer consume same config
- **Outlet-based routing** — AppShell renders `<Outlet />`; feature mechanisms register child routes (blog-list, editor, etc.)
- **No raw styling** — shell chrome uses **style-guide** tokens only; port `portal.css` rules into `index.css` @theme as needed
- **Auth-gated shell** — AppShell mounted only inside **auth-manager** `ProtectedRoute`
- **Afrikaans labels** — primary labels match `superdesk.config.js` langOverride where defined
- **SetupPage remains** — until Phase 1 complete, unauthenticated `/` can show SetupPage; post-auth default is `/liveblog` inside shell

## Implementation Approach

Phase 1 per [plans/README.md](../../README.md#implementation-phases).

1. **Scaffold** — `nav-config.ts` with all routes from legacy activities
2. **Layout tokens** — add shell CSS variables to **style-guide** (`--mar-topbar`, `--mar-nav-width`)
3. **AppShellProvider** — mobile drawer state, route title derivation
4. **TopBar + SideNav** — desktop layout ≥1024px; Maroela logo, nav links
5. **MobileDrawer** — translateX drawer, backdrop click-to-close, body scroll lock
6. **UserMenu** — `useAuth()` display name, sign out, profile link
7. **Route wiring** — replace SetupPage catch-all with AppShell + feature child routes (stubs OK)
8. **Tests + smoke** — Vitest for nav-config, breakpoint hook; visual smoke at :9001

## Components

All components use **style-guide** tokens. Legacy reference: `menu.html`, `portal.css`.

### AppShell

- **Purpose:** Root authenticated layout — top bar, side nav, mobile drawer, main outlet
- **Location:** `components/AppShell.tsx`
- **Props:** `{ children?: React.ReactNode }` (uses `<Outlet />` when no children)
- **Styling:** `maroela-portal` layout — fixed top bar, offset main, side nav width 16rem

### TopBar

- **Purpose:** Fixed header with hamburger (mobile), Maroela logo link, current route title, user menu
- **Location:** `components/TopBar.tsx`
- **Props:** none (uses `useAppShell`, `useRouteTitle`, `useAuth`)
- **Styling:** height 4rem, border-bottom, logo from `/maroela-logo.svg`

### SideNav

- **Purpose:** Persistent left navigation on desktop (≥1024px)
- **Location:** `components/SideNav.tsx`
- **Props:** none (reads `navConfig`)
- **Styling:** width 16rem, main + admin sections, footer “Oor Regstreekse blog” link

### MobileDrawer

- **Purpose:** Slide-in navigation and backdrop overlay on viewports <1024px
- **Location:** `components/MobileDrawer.tsx`
- **Props:** none (uses `useAppShell` open/close)
- **Styling:** `translateX` transition, backdrop `m-nav-backdrop`, close button in drawer header

## Usage Examples

```tsx
import { AppShell } from '@/mechanisms/navigation-manager';
import { ProtectedRoute } from '@/mechanisms/auth-manager';
import { BlogListPage } from '@/mechanisms/blog-list-manager';

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    element={
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    }
  >
    <Route path="/liveblog/*" element={<BlogListPage />} />
    <Route path="/themes" element={<ThemesPage />} />
    <Route index element={<Navigate to="/liveblog" replace />} />
  </Route>
</Routes>
```

```tsx
import { useAppShell } from '@/mechanisms/navigation-manager';

function TopBarHamburger() {
  const { toggleMobileNav, isMobileNavOpen } = useAppShell();
  return (
    <button
      type="button"
      aria-expanded={isMobileNavOpen}
      aria-label="Open menu"
      onClick={toggleMobileNav}
    />
  );
}
```

## Data Flow

```
Authenticated user navigates to /liveblog
  → ProtectedRoute passes
  → AppShell renders TopBar + SideNav (desktop) or TopBar + hidden SideNav (mobile)
  → <Outlet /> renders blog-list-manager BlogListPage
  → useRouteTitle updates TopBar title

Mobile: user taps hamburger
  → AppShellProvider.isMobileNavOpen = true
  → MobileDrawer slides in + backdrop shown
  → NavLink click → navigate + closeMobileNav()

Sign out (UserMenu)
  → auth-manager logout()
  → unmount AppShell → LoginPage
```

## Error Handling Strategy

| Condition | Behaviour |
|-----------|-----------|
| Unauthenticated access to shell route | **auth-manager** redirects to `/login` before AppShell mounts |
| Unknown route inside shell | Render 404 page inside outlet (style-guide card) |
| Missing privilege for admin nav item | Hide item (match legacy `privileges` filter) |
| Feature flag off (marketplace/syndication) | Omit nav entry |

Navigation itself performs no HTTP calls; errors surface from child mechanisms.

## Related Mechanisms

- **[auth-manager](../auth-manager/)** — session, ProtectedRoute, UserMenu sign-out
- **[style-guide](../style-guide/)** — portal shell tokens and layout
- **[blog-list-manager](../blog-list-manager/)** — primary main nav destination
- **[editor-manager](../editor-manager/)** — deep-link routes from notifications/cards

## Testing Requirements

| Level | Scope | Expectation |
|-------|-------|-------------|
| **1 — Unit** | `nav-config`, `useRouteTitle`, breakpoint hook | Vitest |
| **2 — Integration** | AppShell route outlet, mobile drawer open/close | Vitest + React Testing Library |
| **3 — Smoke** | Shell at :9001 | Side nav visible ≥1024px; drawer works <1024px; logo links to `/liveblog`; sign out returns to login |

Dev server: http://localhost:9001.

## Legacy reference

- `client/app/template/core/menu/views/menu.html` — shell template structure
- `client/app/template/core/menu/notifications/views/notifications.html` — user/notifications panel
- `client/app/styles/tailwind/portal.css` — `--mar-nav-width`, `--mar-topbar`, 1024px breakpoint
- `superdesk-core/scripts/core/menu` — menu registration and activity filtering

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
