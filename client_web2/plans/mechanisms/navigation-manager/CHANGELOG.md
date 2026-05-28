# Navigation Manager — Changelog

## 2026-05-27 - Notifications panel

[ADDED] `NotificationsProvider`, `NotificationsPanel`, `NotificationsBell`, `NotificationListItem`. tasks: T-nav-11

## 2026-05-27

[CHANGED] Sub-nav tabs (liveblog + settings) moved into teal drawer as collapsible sections (`NavDrawerExpandableSection`); default collapsed, auto-expand when route is active (no separate chevron control).
[CHANGED] Kennisgewings moved from header bell + slide-out pane into drawer (`NavDrawerNotificationsSection`); removed `NotificationsBell`, `NotificationsPanel`.
[CHANGED] Removed top-bar `Profiel` link and avatar/sign-out control; profile + sign-out remain in drawer (`NavDrawerUserBlock`). Removed `UserMenu.tsx`.
[CHANGED] Horizontal `ShellSubNav` removed from `AppShell` — desktop and mobile share the same `NavMenu` content.
[ADDED] `utils/navSectionActive.ts` + Vitest coverage.
[ADDED] Activity list via `liveblog-api` `listUserActivity` / `markActivityRead`; WS reload on `activity` + `user:mention`. tasks: T-nav-10
[CHANGED] `websocket-manager` `subscribeServerEvent` for Superdesk menu events. tasks: T-nav-10
[COMPLETED] Notifications panel legacy parity. tasks: T-nav-10 through T-nav-12

## 2026-05-27 - Launch: hide expansion-phase admin nav

[CHANGED] `expansionPhase` on freetypes, advertising, marketplace, syndication — hidden unless `VITE_SHOW_EXPANSION_NAV=true`
[CHANGED] Removed DEV override that always showed marketplace/syndication in nav

## 2026-05-25 - Plan Created

[ADDED] Mechanism plan with README, TASKS, CHANGELOG, COMMENTS
[ADDED] Listed in client_web2/plans/README.md mechanism index

## 2026-05-25 - Planner: README elaboration

[CHANGED] README expanded to full MECHANISM_README_STANDARD compliance
[ADDED] Technical Specification, File Structure (ASCII tree), Components, Testing Requirements

## 2026-05-26 - Phase 1 shell

[ADDED] `navigation-manager` — AppShell, NavMenu, ShellSubNav, UserMenu, nav-config. tasks: T-nav-2, T-nav-3, T-nav-4
[ADDED] Layout primitives via style-guide: LbSideNav, LbSubNav, LbTopBar, LbShellMain, LbHamburger, LbNavBackdrop. tasks: T-nav-4
[ADDED] `plans/COMPONENT_INVENTORY.md` — reusable component index
[CHANGED] App routes wired through shell Outlet + placeholder pages. tasks: T-nav-5
[ADDED] Vitest nav-config tests. tasks: T-nav-6
[COMPLETED] Phase 1 shell (smoke manual pending). tasks: T-nav-8

## 2026-05-26 - Top bar muurpapier tiling (Maroela Header parity)

[ADDED] `LbHeaderWatermark`, `useHeaderWatermark` — repeatable `/muurpapier.png` background (1.5 vertical tiles, 20% nudge) on **`LbTopBar`**
[ADDED] `client_web2/public/muurpapier.png` asset (from maroela_web2)
[ADDED] `LbHeaderWatermark.test.tsx`

## 2026-05-26 - Drawer width + mobile hamburger placement fix

[CHANGED] Nav width **16rem → 24rem** (`max-w-sm`, Maroela parity) via `nav-tokens.ts`; main offset `lg:left-[24rem]` / `lg:pl-[24rem]`
[CHANGED] `LbTopBar` — **3-column grid** (`1fr | auto | 1fr`): logo centred on mobile, `end` cluster (user + menu) **right-aligned** in column 3
[CHANGED] `AppShell` — logo moved from `start` to `center`; hamburger remains last in `end` (far right)

## 2026-05-26 - Mobile drawer overhaul (Maroela V6–inspired, full teal)

[CHANGED] `LbSideNav` — full teal gradient panel with inset 3D depth; rounded trailing edge on mobile; no cream/beige inset well
[CHANGED] `LbSideNavLink` — glass tile rows with icon wells, subtitles, and chevron hover (Maroela drawer style on teal)
[ADDED] `LbSideNavMasthead`, `NavDrawerUserBlock`, `afrikaanseDatum` utility
[CHANGED] `NavMenu` — centered logo masthead, date line, user block, section labels (Hoof / Admin)
[CHANGED] `AppShell` — hamburger moved to top-bar **right** on mobile (`UserMenu` + menu button in `end`); logo left on mobile only
[CHANGED] `LbHamburger` — circular bordered control for clearer tap target on the right

## 2026-05-26 - WebSocket connection banner

[CHANGED] `AppShell` — renders `ConnectionBanner` from websocket-manager above `<Outlet />`
[ADDED] Disconnect/reconnect Afrikaans alerts via `LbAlert` (legacy `index.js` Connected/Disconnected parity)
[NOTE] Banner debounced 800ms; fix for spurious flash documented in websocket-manager T-ws-14
