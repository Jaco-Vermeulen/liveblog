# Troubleshooting — UI flash / reconnect loop (websocket-manager)

**Date:** 2026-05-26  
**Mechanisms:** websocket-manager, navigation-manager, editor-manager  
**Severity:** High (UX)  
**Status:** Fixed

## Problem

User reported: connection shows as connected, but **the UI flashes every few seconds** (banner messages, layout shift, possible timeline refetch).

## Environment

- client_web2 dev (`http://localhost:9001`)
- WebSocket `ws://localhost:5100` (Docker `wamp` process)
- Any authenticated route (AppShell + ConnectionBanner)

## Symptoms

- Afrikaans banner alternates: disconnect warning ↔ “Gekoppel aan kennisgewing-bediener!”
- Flash interval ~**5 seconds** (matches `RECONNECT_INTERVAL_MS`)
- Console: repeated `[liveblog-ws:event]` connected/disconnected log entries

## Root cause

In `manager.ts`, `openSocket()` always called `this.client?.close()` before creating a new WebSocket.

Closing the socket fired the **previous** client’s `onClose` handler, which:

1. Set state to `disconnected`
2. Emitted `LiveblogWsEvent.Disconnected` → `ConnectionBanner` warning
3. Called `scheduleReconnect()` → after 5s, `openSocket()` again → loop

The new socket then connected and emitted `Connected` → success banner. Cycle repeated.

Secondary contributors:

- `ConnectionBanner` reacted immediately to brief `disconnected` state (layout jump)
- Editor `onPosts` → `fetchNewPage()` on every `posts` event (no debounce)

## Fix

| Change | File | Task |
|--------|------|------|
| `closeMode: 'replace' \| 'shutdown'` — ignore intentional closes | `manager.ts` | T-ws-12 |
| Idempotent `connect()` when already connected | `manager.ts` | T-ws-13 |
| Banner debounce 800ms | `ConnectionBanner.tsx` | T-ws-14 |
| Editor posts debounce 400ms | `useEditorWebSocket.ts` | T-ws-15 |
| Stay `disconnected` until reconnect timer fires | `manager.ts` | T-ws-16 |

## Verification

### Automated

- `manager.test.ts`: `does not spuriously disconnect on repeated connect()`
- `manager.test.ts`: `reconnects once after server close (no 5s loop)`
- Full suite: `npm test`

### Manual

1. Log in; open `/liveblog` or editor.
2. UI stable for 30+ seconds (no banner flicker).
3. Stop Docker `wamp` → after ~800ms, warning banner.
4. Restart `wamp` → single reconnect info message, then stable.

## Prevention

- Never call `WebSocket.close()` without `closeMode` when replacing sockets.
- Add Vitest regression when changing `openSocket()` / reconnect logic.
- Document protocol in README (JSON, not WAMP) to avoid wrong client library.

## Related

- [Implementation report](../../implementation/2026-05-26-websocket-manager.md)
- [websocket-manager COMMENTS](../../../mechanisms/websocket-manager/COMMENTS.md)
