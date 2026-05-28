# WebSocket Manager — Tasks

## Phase 1

- [x] (T-ws-1) Review legacy module — Superdesk JSON WebSocket (`WebSocketProxy` v1.17), not Autobahn
- [x] (T-ws-2) Create `src/mechanisms/websocket-manager/` scaffold
- [x] (T-ws-3) Implement core hooks/services (`wsManager`, `wamp-client`, types)
- [x] (T-ws-4) Implement `ConnectionBanner` (style-guide `LbAlert`)
- [x] (T-ws-5) Wire `WebSocketProvider` on protected routes (`App.tsx`)
- [x] (T-ws-6) Unit tests (Vitest) — `manager.test.ts`, `wamp-client.test.ts`
- [x] (T-ws-7) Update CHANGELOG + COMMENTS + README implementation notes
- [x] (T-ws-8) Smoke test — `scripts/smoke-websocket.mjs` → `ws://localhost:5100`
- [x] (T-ws-11) Documentation sweep per DOCUMENTATION_PROCEDURES.md

## Phase 1 — Fix (reconnect loop / UI flash)

- [x] (T-ws-12) Fix intentional socket replace — `closeMode` replace/shutdown (no spurious disconnect)
- [x] (T-ws-13) Idempotent `connect()` when already connected to same URL
- [x] (T-ws-14) ConnectionBanner debounce (800ms) for disconnect warning
- [x] (T-ws-15) Editor `posts` handler debounce (400ms) via `useEditorWebSocket`
- [x] (T-ws-16) Reconnect state: stay `disconnected` until timer fires (legacy parity)
- [x] (T-ws-17) Troubleshooting report + test report

## Phase 2

- [x] (T-ws-9) `instance_settings:updated` consumer in settings-manager
- [COMPLETED] Phase 2 instance settings sync. tasks: T-ws-9

## Phase 3+

- [x] (T-ws-10) Optional blog-list live updates (`useBlogListWebSocket` invalidates on `blog` WS event)
