# WebSocket Manager — Test Summary

**Date:** 2026-05-26  
**Command:** `npm test` (full suite; JSON → `test-results.json`)

## Results (websocket-manager)

| File | Tests | Status |
|------|-------|--------|
| `manager.test.ts` | 5 | pass |
| `wamp-client.test.ts` | 1 | pass |

## websocket-manager test cases

| Test | Purpose |
|------|---------|
| transitions to connected and emits Connected | State + synthetic event |
| dispatches server messages to typed subscribers | `{ event, extra }` parse path |
| does not spuriously disconnect on repeated connect() | **Regression: reconnect loop fix (T-ws-12)** |
| reconnects once after server close (no 5s loop) | Single reconnect after drop |
| unsubscribes handlers | Cleanup |
| parses { event, extra } JSON payloads | `wamp-client` unit |

## Full suite (project)

| Metric | Value |
|--------|-------|
| Test files | 23 |
| Tests | 62 |
| Duration | ~3s |

## Smoke (Docker :5100)

| Script | Result |
|--------|--------|
| `node scripts/smoke-websocket.mjs` | pass — WebSocket open to `ws://localhost:5100` |

## Manual (Level 3)

| Step | Expected |
|------|----------|
| Login → any page | No banner flicker for 30s |
| Stop `wamp` container/process | Warning after ~800ms |
| Restart `wamp` | One info reconnect message |
| Open editor; publish in second tab | Timeline updates (400ms debounced refetch) |

## Gaps

- No Playwright E2E for WS lifecycle
- T-ws-9 / T-ws-10 not covered

## Related

- [Implementation report](../../implementation/2026-05-26-websocket-manager.md)
- [Troubleshooting: UI flash](../../troubleshooting/ui-flash-reconnect-loop/troubleshooting-summary.md)
- Mechanism [CHANGELOG](../../../mechanisms/websocket-manager/CHANGELOG.md)
