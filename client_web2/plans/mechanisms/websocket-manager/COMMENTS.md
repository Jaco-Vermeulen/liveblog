# WebSocket Manager — Comments

## 2026-05-25

Phase 0 planning session. Mechanism scaffold created as part of full client_web2 plans structure (maroela_web2 pattern).

Legacy reference: `client WebSocket/WAMP usage in liveblog-edit` (server process named `wamp`; client protocol is **not** Autobahn).

## 2026-05-26 — Phase 1 implementation

**Status:** Completed  
**Phase:** Phase 1 core

**Protocol discovery:** Liveblog legacy uses **plain WebSocket + JSON** (`{ event, extra }`), not Autobahn WAMP — see `liveblog/superdesk-client-core@v1.17.0-liveblog` `scripts/core/notification/notification.js` `WebSocketProxy`. Server process is still named `wamp` in `server/Procfile`.

**Wiring:**

- `WebSocketProvider` connects after auth (`state.sessionId` present); disconnects on logout.
- All I/O logged via `request-logger` `wsConnection` / `wsEvent`.
- `App.tsx`: provider wraps `AppShell` inside `ProtectedRoute`.

**Editor integration:**

- `useEditorWebSocket` subscribes to `posts`, `blog`, `embed_generation_error`, `removing_timeline_post`.
- Replaces Phase 3 stub; unblocks T-edit-13 / T-edit-14.

**Smoke (T-ws-8):** `node scripts/smoke-websocket.mjs` — OK to `ws://localhost:5100`.

**Phase 2 (T-ws-9):** `instance_settings:updated` → settings-manager `InstanceFeaturesProvider` (see settings-manager CHANGELOG T-set-12).

**T-ws-10 done (2026-05-27):** `blog-list-manager/hooks/useBlogListWebSocket.ts` invalidates list on `blog` WS event. See [blog-list-manager CHANGELOG](../blog-list-manager/CHANGELOG.md).

## 2026-05-26 — Fix: UI flash every ~5 seconds (user report)

**Status:** Fixed  
**Symptom:** UI flashed every few seconds; “connected” message appeared repeatedly.

**Root cause:** `openSocket()` called `client.close()` before opening a new socket. The old socket’s `onClose` handler treated that as an unintended disconnect: set state to `disconnected`, emitted `LiveblogWsEvent.Disconnected`, and scheduled reconnect in **5000ms** (`RECONNECT_INTERVAL_MS`). When the timer fired, `openSocket()` ran again → close → repeat. Connection banner and `Connected` events toggled on each cycle.

**Fix:**

1. `closeMode: 'replace' | 'shutdown'` — intentional closes do not emit disconnect or schedule reconnect.
2. Idempotent `connect()` when already connected to the same URL.
3. Banner debounce (800ms) and editor `posts` debounce (400ms).
4. `scheduleReconnect()` keeps `disconnected` until the timer fires (matches legacy UX).

**Verification:** Vitest `manager.test.ts` — no spurious disconnect on repeated `connect()`; single reconnect after server close. Manual: stable UI after refresh.

**Reports:** `plans/reports/troubleshooting/ui-flash-reconnect-loop/`

## Design notes

- File `wamp-client.ts` is a historical name; implements Superdesk JSON WebSocket only.
- **No raw `WebSocket`** outside this mechanism (project rule).
- Syndication ingest panel still needs `posts` consumer wiring (syndication-manager Phase 6+).
