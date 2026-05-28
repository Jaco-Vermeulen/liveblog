# WebSocket Manager — Implementation Report

**Date:** 2026-05-26  
**Scope:** `client_web2/` websocket-manager Phase 1 + reconnect-loop fix  
**Status:** Complete (T-ws-9, T-ws-10 deferred)

## Summary

Implements real-time notifications for web2 using the **same protocol as legacy Superdesk** (plain WebSocket + JSON `{ event, extra }`), not Autobahn WAMP. Unblocks editor live timeline updates (`useEditorWebSocket`) and shell connection status (`ConnectionBanner`).

## Mechanisms touched

| Mechanism | Change | Tasks |
|-----------|--------|-------|
| websocket-manager | New implementation | T-ws-1–T-ws-8, T-ws-11–T-ws-17 |
| editor-manager | `useEditorWebSocket` real + debounce | T-edit-13, T-edit-14 |
| navigation-manager | `ConnectionBanner` in AppShell | T-ws-4 |
| request-logger | WS helpers used (no code change) | — |

## Architecture

```
auth-manager (sessionId)
    └── WebSocketProvider
            └── wsManager.connect(ws://localhost:5100)
                    └── createSuperdeskWsClient
                            └── onmessage → LiveblogWsEvent handlers
```

## Source files

| Path | Role |
|------|------|
| `src/mechanisms/websocket-manager/wamp-client.ts` | WebSocket + JSON parse + logger |
| `src/mechanisms/websocket-manager/manager.ts` | Singleton, subscribe, reconnect, `closeMode` |
| `src/mechanisms/websocket-manager/context/WebSocketProvider.tsx` | Auth-gated lifecycle |
| `src/mechanisms/websocket-manager/components/ConnectionBanner.tsx` | Shell UI |
| `src/mechanisms/websocket-manager/hooks/useWebSocket.ts` | `useSyncExternalStore` |
| `src/mechanisms/websocket-manager/hooks/useWsEvent.ts` | React subscriptions |
| `scripts/smoke-websocket.mjs` | Connect smoke |

## Events consumed (Phase 1)

| Event | Editor | Shell |
|-------|--------|-------|
| `posts` | Timeline refetch (debounced) | — |
| `blog` | Public URL updates | — |
| `embed_generation_error` | Per-blog handler | — |
| `removing_timeline_post` | Remove from timeline | — |
| `connected` / `disconnected` | — | Banner |

## Bug fix (same day)

**Symptom:** UI flashed every ~5s; “connected” message repeated.

**Root cause:** `openSocket()` closed the previous socket; `onClose` scheduled reconnect every 5s indefinitely.

**Fix:** `closeMode` for replace/shutdown; idempotent `connect()`; banner/editor debounce.

See [troubleshooting report](../troubleshooting/ui-flash-reconnect-loop/troubleshooting-summary.md).

## Tests

| Level | Result | Report |
|-------|--------|--------|
| Vitest | 57 tests (websocket-manager: 6) | [test-summary](../tests/websocket-manager/2026-05-26/test-summary.md) |
| Smoke | `smoke-websocket.mjs` pass | T-ws-8 |
| Build | `npm run build` pass | — |

## Known gaps

| Item | Task |
|------|------|
| `instance_settings:updated` in settings | T-ws-9 |
| Blog-list live refresh | T-ws-10 |
| Syndication ingest `posts` panel | syndication-manager |
| Embed error 3h throttle UI | editor-manager (legacy localStorage parity) |

## Documentation updated

- Mechanism four-file set (websocket-manager)
- editor-manager CHANGELOG / COMMENTS / TASKS
- navigation-manager CHANGELOG / COMMENTS
- `plans/CHANGELOG.md`, `KNOWLEDGE_GRAPH.md`, `COMPONENT_INVENTORY.md`, `plans/README.md`
- Meeting: `plans/meetings/2026-05-26-websocket-manager.md`
