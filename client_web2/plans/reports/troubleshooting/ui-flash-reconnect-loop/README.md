# Troubleshooting: UI flash / reconnect loop

**Date:** 2026-05-26  
**Mechanism:** websocket-manager  
**Symptom:** Shell UI flashed every ~5 seconds; Afrikaans “Gekoppel aan kennisgewing-bediener!” banner appeared repeatedly while stack was healthy.

## Root cause

`WebSocketManagerImpl.openSocket()` always called `client.close()` before creating a new socket. The close handler treated every close as an unintended disconnect:

1. State → `disconnected`
2. Emit `LiveblogWsEvent.Disconnected`
3. Schedule reconnect in 5000ms
4. Timer fires → `openSocket()` → close again → loop

Side effects: `ConnectionBanner` layout shifts, editor `posts` handlers refiring.

## Fix

| Change | File |
|--------|------|
| `closeMode: 'replace' \| 'shutdown'` — skip disconnect/reconnect on intentional close | `manager.ts` |
| Idempotent `connect()` when same URL and already connected/connecting | `manager.ts` |
| 800ms debounce before disconnect banner | `ConnectionBanner.tsx` |
| 400ms debounce on editor `posts` refetch | `useEditorWebSocket.ts` |

## Verification

- Vitest `manager.test.ts`: no spurious disconnect on repeated `connect()`; single reconnect after server close
- Manual: editor + blog list stable after refresh with Docker `wamp` running

## Prevention

Do not call `WebSocket.close()` before opening a replacement socket without marking the close as intentional.
