# Style Guide

Single source of truth for Maroela visual design in client_web2. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Centralized design system: Maroela design tokens (Tailwind CSS 4 `@theme`), base typography, layout shell primitives, and shared `Lb*` UI components. **Every UI mechanism MUST list style-guide as a REQUIRED dependency** and MUST NOT introduce ad-hoc colours, gradients, or one-off component styling.

## Status

**Phase 1 implemented** — tokens, `@source` scanning, layout shell components (`LbSideNav`, `LbTopBar`, `LbSubNav`, …), full UI library (`LbCard` compound API, `LbAuthCard`, forms, alerts, modal). `LbTable` deferred to Phase 2+.

## Purpose

- Define Maroela design tokens aligned with legacy `client/app/styles/tailwind/portal.css`
- Own shared UI and layout primitives (`Lb*` prefix) used across all feature mechanisms
- Enforce visual consistency — no ad-hoc styling in feature code
- Document typography, colours, spacing, and responsive breakpoints
- Gate all styling changes through this mechanism (README + CHANGELOG first)
- Maintain [COMPONENT_INVENTORY.md](../../COMPONENT_INVENTORY.md) as the quick index

## Current Implementation

### Legacy (`client/`)

- **Tokens and shell overrides:** `client/app/styles/tailwind/portal.css` — CSS custom properties (`--mar-*`), body typography, top bar (4rem), side nav (16rem), 1024px drawer
- **Menu template:** `client/app/template/core/menu/views/menu.html`
- **Font:** Lato via HTML template

### Web2 (`client_web2/`)

- **Tokens:** `src/index.css` — `@theme`, `@source './**/*.{ts,tsx}'`, `@layer base`
- **Layout:** `src/components/layout/` — shell, side nav, sub-nav, login split, content containers
- **UI:** `src/components/ui/` — buttons, cards, forms, alerts, modal, auth card
- **Utility:** `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge)
- **Barrel imports:** `@/components/ui`, `@/components/layout`

## Dependencies

None — foundational mechanism. All other UI mechanisms depend on this.

## Dependents

**REQUIRED dependency for all UI mechanisms:**

auth-manager, navigation-manager, blog-list-manager, editor-manager, settings-manager, themes-manager, analytics-manager, syndication-manager, marketplace-manager, advertising-manager, freetypes-manager

Non-UI mechanisms (request-logger, liveblog-api, websocket-manager) do not depend on style-guide unless they expose UI.

## Technical Specification

### Design tokens

| Token | Tailwind | Value |
|-------|----------|-------|
| page | `bg-mar-page` | `#f5efe7` |
| orange | `bg-mar-orange` | `#c45712` |
| orange-dark | `bg-mar-orange-dark` | `#a0450e` |
| teal | `bg-mar-teal` | `#157578` |
| teal-dark | `bg-mar-teal-dark` | `#0d4f52` |
| accent | `bg-mar-accent` | `#c8503a` |
| text | `text-mar-text` | `#1c1917` |
| muted | `text-mar-muted` | `#57534e` |
| meta | `text-mar-meta` | `#78716c` |
| card | `bg-mar-card` | `#faf6f0` (elevated surfaces, blog cards) |
| panel | `bg-mar-panel` | `#f3ebe2` (functional panels, editor chrome) |
| nav bar | `bg-white` on `LbTopBar` | `#ffffff` (main top bar only) |
| input | `bg-mar-input` | `#fffdf8` (fields, in-panel cards) |
| border | `border-mar-border` | `#e2dcd2` |
| beige | `bg-mar-beige` | `#f0e9df` |
| font | `font-sans` | Lato, Segoe UI, … |
| nav breakpoint | `lg:` | `64rem` (1024px) |

### Layout constants

| Constant | Value | Usage |
|----------|-------|-------|
| Top bar | `4rem` / `h-16` | `LbTopBar` |
| Side nav | `16rem` / `w-64` | `LbSideNav` |
| Body font | `1.0625rem` | `@layer base` body |

### Styling rules

1. **No gradients** — solid Maroela tokens only in web2
2. **No raw hex** in feature code — use `@theme` tokens
3. **Tailwind only** — no separate `.css` files for components (except `index.css` tokens)
4. **Import from barrels** — `@/components/ui`, `@/components/layout`

### Component API summary

```typescript
type LbButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';

type LbCardVariant = 'default' | 'elevated' | 'interactive' | 'flat' | 'outline';

// LbCard compound: LbCardHeader, LbCardTitle, LbCardSubtitle, LbCardEyebrow,
// LbCardDescription, LbCardBody, LbCardFooter, LbCardMeta, LbCardIcon, LbCardMedia,
// LbFeatureCard, LbPanelCard

function cn(...inputs: ClassValue[]): string;
```

## File Structure

The mechanism is implemented by the following paths (under `client_web2/`):

```
src/
├── index.css                           # @theme, @source, @layer base
├── lib/
│   └── utils.ts                        # cn() helper
├── components/
│   ├── layout/
│   │   ├── index.ts                    # Barrel exports
│   │   ├── LbAppShell.tsx              # Shell composer
│   │   ├── LbTopBar.tsx                # Fixed 4rem header
│   │   ├── LbSideNav.tsx               # Teal side panel + LbSideNavLink
│   │   ├── LbSubNav.tsx                # Horizontal tab sub-nav
│   │   ├── LbShellMain.tsx             # Main outlet offsets
│   │   ├── LbHamburger.tsx             # Mobile menu toggle
│   │   ├── LbNavBackdrop.tsx           # Drawer overlay
│   │   ├── LbContentContainer.tsx      # Page width wrapper
│   │   ├── LbPageHeader.tsx            # Page title block
│   │   ├── LbAppHeader.tsx             # Simple header (legacy)
│   │   ├── LbFullscreenShell.tsx       # Full viewport (login)
│   │   ├── LbSplitLayout.tsx           # Brand + main split
│   │   ├── LbBrandPanel.tsx            # Login brand column
│   │   └── LbMainPanel.tsx             # Scrollable main column
│   └── ui/
│       ├── index.ts                    # Barrel exports
│       ├── LbButton.tsx
│       ├── LbBadge.tsx
│       ├── LbCard.tsx                  # Compound card system
│       ├── LbCard.test.tsx
│       ├── LbAuthCard.tsx              # Login card + LbAuthForm
│       ├── LbInput.tsx
│       ├── LbFormField.tsx
│       ├── LbAlert.tsx
│       ├── LbSpinner.tsx
│       ├── LbLoadingScreen.tsx
│       └── LbModal.tsx
plans/
├── COMPONENT_INVENTORY.md              # Quick component index
└── mechanisms/style-guide/             # This documentation
```

## Design Decisions

- **Tailwind 4 CSS-first** — `@theme` + `@source` for full utility generation
- **`Lb` prefix** — design-system primitives vs feature components
- **Layout vs UI split** — shell chrome in `layout/`, controls in `ui/`
- **Compound LbCard** — header/title/subtitle/body/footer/meta composition
- **LbAuthCard** — dedicated login UX (no generic panel divider)
- **No dark mode** — light theme only until product decision
- **No gradients** — user directive; solid teal brand panel

## Implementation Approach

| Phase | Deliverable |
|-------|-------------|
| **0** | Tokens, `LbButton`, `LbCard`, `LbBadge`, `cn()` |
| **1 (current)** | Layout shell, full card API, forms, auth card, modal, alert |
| **2** | `LbTable`, data grid patterns, blog card tile |
| **3+** | Primitives as feature mechanisms require |

## Components

### Layout (shell)

| Component | Purpose | Location |
|-----------|---------|----------|
| `LbAppShell` | Compose backdrop + side nav + top bar + main | `layout/LbAppShell.tsx` |
| `LbTopBar` | Fixed header, route title | `layout/LbTopBar.tsx` |
| `LbSideNav` | 16rem teal nav panel | `layout/LbSideNav.tsx` |
| `LbSideNavLink` | Nav item with active state | `layout/LbSideNav.tsx` |
| `LbSubNav` | Horizontal tabs | `layout/LbSubNav.tsx` |
| `LbShellMain` | Outlet area with offsets | `layout/LbShellMain.tsx` |
| `LbHamburger` | Mobile toggle | `layout/LbHamburger.tsx` |
| `LbContentContainer` | max-width page wrapper | `layout/LbContentContainer.tsx` |

### UI (controls & surfaces)

| Component | Purpose | Location |
|-----------|---------|----------|
| `LbButton` | Actions (`primary`/`secondary`/`ghost`/`accent`) | `ui/LbButton.tsx` |
| `LbCard` + compound | Cards with title, subtitle, footer | `ui/LbCard.tsx` |
| `LbAuthCard` | Login / auth surfaces | `ui/LbAuthCard.tsx` |
| `LbPanelCard` | Header + body panels | `ui/LbCard.tsx` |
| `LbFeatureCard` | Icon + title + description tile | `ui/LbCard.tsx` |
| `LbInput` / `LbFormField` | Form controls | `ui/LbInput.tsx`, `LbFormField.tsx` |
| `LbAlert` | Error/info banners | `ui/LbAlert.tsx` |
| `LbModal` | Dialog overlay | `ui/LbModal.tsx` |
| `LbBadge` | Status chips | `ui/LbBadge.tsx` |

Full list: [COMPONENT_INVENTORY.md](../../COMPONENT_INVENTORY.md).

## Usage Examples

```tsx
import { LbPanelCard, LbButton, LbBadge } from '@/components/ui';
import { LbContentContainer } from '@/components/layout';

export function ExamplePage() {
  return (
    <LbContentContainer size="lg">
      <LbPanelCard title="Blogs" subtitle="Manage liveblogs" eyebrow="Phase 2">
        <LbBadge variant="teal">Live</LbBadge>
        <LbButton variant="primary">Create</LbButton>
      </LbPanelCard>
    </LbContentContainer>
  );
}
```

## Error Handling Strategy

Presentational only. Form errors use `LbAlert variant="error"`. Input error state via `LbInput` `error` prop.

## Related Mechanisms

- **navigation-manager** — primary consumer of layout shell components
- **auth-manager** — `LbAuthCard`, login split layout
- All feature mechanisms — import `Lb*` primitives

## Testing Requirements

| Level | Expectation |
|-------|-------------|
| **1 — Unit** | `LbCard.test.tsx`; `cn()` behaviour |
| **2 — Component** | Render each primitive; token classes only |
| **3 — Smoke** | Shell + login at :9001; Maroela palette visible |

## Legacy reference

- `client/app/styles/tailwind/portal.css`
- `client/app/template/core/menu/views/menu.html`

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
