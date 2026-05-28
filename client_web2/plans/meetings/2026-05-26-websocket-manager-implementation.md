# Meeting notes — WebSocket manager Phase 1–2

**Date:** 2026-05-26  
**Attendees:** Implementation agent + user feedback  
**Topic:** websocket-manager, settings WS sync, UI stability

## Decisions

1. **Protocol:** Client uses Superdesk JSON WebSocket (`{ event, extra }`), not Autobahn WAMP — matches superdesk-client-core v1.17.
2. **Scope Phase 1:** Connection manager, shell banner, editor `posts` / `blog` / embed / timeline events.
3. **Scope Phase 2 (T-ws-9):** `instance_settings:updated` reloads feature flags via `GET /instance_settings/current` (legacy `featuresService` parity).
4. **Reconnect fix:** Intentional socket close must not trigger disconnect/reconnect loop (user-reported UI flash).

## Out of scope (deferred)

- Blog-list live refresh (T-ws-10)
- Syndication ingest WebSocket panel
- Full `featuresService` limits/bandwidth in React

## References

- Implementation report: `plans/reports/implementation/2026-05-26-websocket-manager-phase1-2.md`
- Troubleshooting: `plans/reports/troubleshooting/ui-flash-reconnect-loop/`
