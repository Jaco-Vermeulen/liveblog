# Navigation Manager — Comments

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `client/app/template/core/menu`, `client/app/styles/tailwind/portal.css`

## 2026-05-26 — Phase 1d complete

AppShell composes style-guide `Lb*` layout components; mechanism owns nav-config and feature wiring only. Sub-nav tabs for `/liveblog` (active/archived/deleted) and `/settings` (general/instance). Mobile drawer uses `LbHamburger` + `LbNavBackdrop` at `<lg` (1024px).

## 2026-05-26 — Architecture note

Shell chrome lives in `src/components/layout/` (style-guide). `navigation-manager` stays thin: config + `AppShell` composer + `UserMenu`. Avoid duplicating TopBar/SideNav in mechanism folder.

## 2026-05-26 — ConnectionBanner (websocket-manager)

- `AppShell` imports `ConnectionBanner` from `@/mechanisms/websocket-manager` (mechanism owns UI; shell hosts placement).
- User-reported UI flash every ~5s — root cause in websocket-manager `openSocket()` close handler; fixed T-ws-12–16. See `plans/reports/troubleshooting/ui-flash-reconnect-loop/`.

## 2026-05-27 — Drawer sub-nav + in-menu notifications

- Main nav tabs (`/liveblog/*`, `/settings/*`) live in `NavMenu` expandable sections, not `LbSubNav` under the top bar.
- `NavDrawerExpandableSection`: collapsed by default; `useEffect` expands when `isNavSectionActive` is true.
- Notifications: drawer block only (no top-bar bell). Unread count badge on section header; section auto-expands when `unread > 0`.

## Follow-ups

- Footer “Oor Regstreekse blog” button — stub only (about modal Phase 1+).
- Docker smoke checkbox in TASKS — verify side nav + drawer manually at http://localhost:9001 after login.
