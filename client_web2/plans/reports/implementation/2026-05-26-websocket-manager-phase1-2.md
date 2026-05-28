# WebSocket Manager — Phase 1–2 Implementation Report

**Date:** 2026-05-26  
**Scope:** `client_web2/src/mechanisms/websocket-manager/`, settings-manager WS consumer, editor real-time  
**Status:** Phase 1 complete; Phase 2 (T-ws-9) complete

## Summary

Implemented Superdesk JSON WebSocket client (not Autobahn WAMP), wired connection lifecycle into the authenticated shell, replaced editor WebSocket stub with live subscriptions, fixed a reconnect loop that caused UI flashing, and connected `instance_settings:updated` to settings-manager feature flags.

## Phase 1 deliverables

| Area | Implementation |
|------|----------------|
| Protocol | `{ event, extra }` JSON messages (superdesk-client-core v1.17 `WebSocketProxy`) |
| Core | `wsManager`, `createSuperdeskWsClient`, reconnect (5s) |
| React | `WebSocketProvider`, `useWebSocket`, `useWsEvent`, `ConnectionBanner` |
| Logging | `request-logger` `wsConnection` / `wsEvent` |
| Editor | `useEditorWebSocket` — `posts`, `blog`, `embed_generation_error`, `removing_timeline_post` |
| Env | `VITE_LIVEBLOG_WS_URL` (default `ws://localhost:5100`) |

## Phase 2 deliverables (T-ws-9)

| Consumer | Behaviour |
|----------|-----------|
| `InstanceFeaturesProvider` | Reload `GET /instance_settings/current` on `instance_settings:updated` |
| `NavMenu` | Marketplace / syndication nav from API features (env fallback) |
| `InstanceSettingsPage` | Remote JSON reload when form not dirty |

## Troubleshooting: UI flash (fixed)

**Cause:** `openSocket()` closed the active socket before each (re)open → spurious `onClose` → 5s reconnect loop.

**Fix:** Intentional close modes, idempotent `connect()`, banner/posts debounce.

Report: `plans/reports/troubleshooting/ui-flash-reconnect-loop/README.md`

## Verification

| Check | Result |
|-------|--------|
| `npm test` | pass (57 tests) |
| `npm run build` | pass |
| `node scripts/smoke-websocket.mjs` | pass → `ws://localhost:5100` |

## Files (main)

```
client_web2/src/mechanisms/websocket-manager/
client_web2/src/mechanisms/settings-manager/context/InstanceFeaturesProvider.tsx
client_web2/src/lib/config/resolveFeatureFlags.ts
client_web2/scripts/smoke-websocket.mjs
```

## Deferred

- T-ws-10 — blog-list live updates
- Syndication ingest `posts` panel (syndication-manager)
- Full `featuresService` API (`isLimitReached`, bandwidth) — only nav flags wired today

## Related docs

- `plans/mechanisms/websocket-manager/README.md`
- `plans/mechanisms/settings-manager/CHANGELOG.md` (T-set-12)
- `plans/KNOWLEDGE_GRAPH.md`
