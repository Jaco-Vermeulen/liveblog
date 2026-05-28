# Meeting — WebSocket Manager Phase 1 + reconnect fix

**Date:** 2026-05-26  
**Attendees:** Implementation agent, user (flash report)

## Decisions

1. **Protocol:** Use Superdesk v1.17 JSON WebSocket (`{ event, extra }`), not Autobahn WAMP, despite `wamp` server process name.
2. **Singleton:** `wsManager` + `WebSocketProvider` after auth (matches legacy `WebSocketProxy` + session).
3. **Intentional close:** `closeMode` required when replacing or shutting down sockets.
4. **UI:** `ConnectionBanner` in AppShell with debounce; Afrikaans copy for disconnect/reconnect.

## Outcomes

- Phase 1 websocket-manager complete (T-ws-1–T-ws-8).
- Editor stub replaced (T-edit-13, T-edit-14).
- Reconnect loop bug fixed same day (T-ws-12–T-ws-17).

## Deferred

- T-ws-9: settings `instance_settings:updated`
- T-ws-10: blog-list live updates
- Syndication ingest WebSocket wiring

## References

- [Implementation report](../reports/implementation/2026-05-26-websocket-manager.md)
- [Troubleshooting: UI flash](../reports/troubleshooting/ui-flash-reconnect-loop/troubleshooting-summary.md)
