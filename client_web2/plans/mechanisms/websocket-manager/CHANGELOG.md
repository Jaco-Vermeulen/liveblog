# WebSocket Manager — Changelog

## 2026-05-27 - Menu notification events

[ADDED] `subscribeServerEvent` + `useWsServerEvent` for Superdesk events outside `LiveblogWsEvent` enum (`activity`, `user:mention`).
[CHANGED] `dispatchServerMessage` invokes server-event handlers before typed liveblog handlers.

## 2026-05-25 - Plan Created

[ADDED] Mechanism plan with README, TASKS, CHANGELOG, COMMENTS
[ADDED] Listed in client_web2/plans/README.md mechanism index

## 2026-05-25 - Planner: README elaboration

[CHANGED] README expanded to full MECHANISM_README_STANDARD compliance
[ADDED] Technical Specification, File Structure (ASCII tree), Components, Testing Requirements

## 2026-05-26 - Phase 1 implementation

[ADDED] `src/mechanisms/websocket-manager/` — Superdesk JSON WebSocket client (`wamp-client.ts`), `wsManager`, `WebSocketProvider`, `useWebSocket`, `useWsEvent`, `ConnectionBanner`. tasks: T-ws-2, T-ws-3, T-ws-4
[ADDED] Unit tests: `manager.test.ts`, `wamp-client.test.ts`. tasks: T-ws-6
[ADDED] Smoke `scripts/smoke-websocket.mjs`. tasks: T-ws-8
[CHANGED] `App.tsx` — `WebSocketProvider` inside `ProtectedRoute`. tasks: T-ws-5
[CHANGED] `navigation-manager` AppShell — `ConnectionBanner`. tasks: T-ws-4
[CHANGED] `editor-manager` `useEditorWebSocket` — real `useWsEvent` subscriptions (replaces stub)
[NOTE] Protocol matches superdesk-client-core v1.17 `WebSocketProxy` (`{ event, extra }`), not Autobahn WAMP

## 2026-05-26 — Reconnect loop fix (troubleshoot)

[FIXED] UI flash every ~5s — `openSocket()` closed the live socket before opening a new one, firing `onClose` → reconnect timer loop
[CHANGED] `manager.ts` — intentional close modes (`replace` / `shutdown`), idempotent `connect()`
[CHANGED] `ConnectionBanner.tsx` — 800ms debounce before disconnect warning; auto-dismiss reconnect success
[CHANGED] `useEditorWebSocket.ts` — 400ms debounce on `posts` refetch
[ADDED] Vitest: spurious disconnect + single reconnect cases. tasks: T-ws-8
[ADDED] Smoke `scripts/smoke-websocket.mjs`

## 2026-05-26 — Phase 2 instance settings event

[CHANGED] settings-manager consumes `instance_settings:updated` (T-ws-9) — see settings-manager CHANGELOG T-set-12
[COMPLETED] Phase 1 websocket-manager core. tasks: T-ws-1 through T-ws-8
[MILESTONE] Phase 1 — 100%

## 2026-05-26 - Fix: reconnect loop / UI flash

[FIXED] `openSocket()` closing an existing socket triggered `onClose` → spurious `disconnected` + 5s reconnect loop → banner/timeline flash. tasks: T-ws-12
[FIXED] Added `closeMode` (`replace` | `shutdown`) to ignore intentional closes. tasks: T-ws-12
[CHANGED] `connect()` idempotent when already connected to same URL. tasks: T-ws-13
[CHANGED] `ConnectionBanner` — 800ms debounce before disconnect warning. tasks: T-ws-14
[CHANGED] `useEditorWebSocket` — 400ms debounce on `posts` timeline refetch. tasks: T-ws-15
[CHANGED] `scheduleReconnect()` — remain `disconnected` until timer (not immediate `reconnecting`). tasks: T-ws-16
[ADDED] Troubleshooting report `plans/reports/troubleshooting/ui-flash-reconnect-loop/`
[ADDED] Test report `plans/reports/tests/websocket-manager/2026-05-26/`
[ADDED] Implementation report `plans/reports/implementation/2026-05-26-websocket-manager.md`
[COMPLETED] Documentation sweep. tasks: T-ws-11, T-ws-17
