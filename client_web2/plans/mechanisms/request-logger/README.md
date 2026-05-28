# Request Logger

Structured logging for all external I/O in client_web2. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Every REST call (via **liveblog-api**) and WebSocket message (via **websocket-manager**) MUST be logged through this mechanism. No silent external I/O. Phase 0 ships a console-based singleton with an in-memory ring buffer; Phase 1 moves ownership to `src/mechanisms/request-logger/` and adds optional dev-tools UI.

## Status

**Phase 1 implemented** — canonical module at `src/mechanisms/request-logger/` (HTTP + WS helpers, 200-entry ring buffer). `src/lib/logger/index.ts` re-exports for backward compatibility. LogPanel UI deferred.

## Purpose

- Log every external request, response, and error with correlation IDs
- Maintain a bounded in-memory history for debugging during legacy migration
- Provide a single audit trail for REST and WebSocket traffic
- Feed a future dev-tools panel (export, filter, persistence)
- Enforce the project rule: **no raw `fetch()` or `WebSocket` without logging**

## Current Implementation

### Legacy (`client/`)

- **No dedicated logger module** — Superdesk `api` service and WAMP client log minimally to browser console; no structured ring buffer or correlation IDs
- **Reference patterns:** `superdesk-core/scripts/core/api` (HTTP), Superdesk notification service (WAMP → `$rootScope` events in `client/app/scripts/index.js`)

### Web2 (`client_web2/`)

- **Canonical module:** `src/mechanisms/request-logger/` — ring buffer (200), HTTP + WebSocket helpers, `[liveblog-api:*]` / `[liveblog-ws:*]` console prefixes
- **Wired:** `liveblog-api` `apiRequest` logs every request/response/error with correlation IDs
- **Compat re-export:** `src/lib/logger/index.ts` → `@/mechanisms/request-logger` (deprecated import path)
- **Deferred:** LogPanel dev UI (`components/LogPanel.tsx` in plan only)

## Dependencies

None — foundational mechanism consumed by all I/O layers.

## Dependents

- **liveblog-api** (REQUIRED) — logs every HTTP request/response/error
- **websocket-manager** (REQUIRED) — logs connect, disconnect, subscribe, and inbound events
- **auth-manager**, **blog-list-manager**, **editor-manager**, and all feature mechanisms — indirect consumers via liveblog-api and websocket-manager
- Future **dev-tools panel** — reads `getHistory()` / export API

## Technical Specification

### Log entry schema

```typescript
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogDirection = 'request' | 'response' | 'error' | 'event';

export type IoChannel = 'http' | 'websocket';

export interface ApiLogEntry {
  id: string;
  timestamp: string;           // ISO 8601
  channel: IoChannel;
  direction: LogDirection;
  method?: string;             // HTTP method or WS verb (e.g. SUBSCRIBE)
  url?: string;                // REST path or WS topic
  status?: number;             // HTTP status code
  durationMs?: number;         // elapsed since matching request
  message?: string;            // error text or event summary
  payloadSize?: number;        // optional serialized byte estimate
}

export interface Logger {
  /** Start HTTP request log; returns correlation id */
  request(method: string, url: string): string;

  /** Complete HTTP request log */
  response(id: string, status: number, durationMs: number, url?: string): void;

  /** Record HTTP or WS failure */
  error(id: string, message: string, url?: string): void;

  /** Log inbound/outbound WebSocket event */
  wsEvent(
    direction: 'in' | 'out',
    topic: string,
    eventName: string,
    summary?: string,
  ): string;

  /** Connection state change */
  wsConnection(state: 'connected' | 'disconnected', url: string): void;

  /** Read-only snapshot of ring buffer (newest first) */
  getHistory(): readonly ApiLogEntry[];

  /** Clear buffer (dev only) */
  clearHistory(): void;
}

export const logger: Logger;
```

### Ring buffer rules

| Rule | Value |
|------|-------|
| Maximum entries | **200** (`MAX_HISTORY`) |
| Eviction | FIFO — oldest entry dropped when limit exceeded |
| Order | Newest first (`unshift` on push) |
| Storage | In-memory only (Phase 0–1); no localStorage persistence |
| Correlation | HTTP: `crypto.randomUUID()` per request; WS events get unique ids |
| Console | `console.info` for request/response/event; `console.error` for errors |
| Prefix | `[liveblog-api:request\|response\|error]` (Phase 0); extend to `[liveblog-ws:…]` in Phase 1 |

### Phase 0 stub (implemented)

The current `src/lib/logger/index.ts` implements `request`, `response`, `error`, and `getHistory` for HTTP only. `channel` defaults implicitly to `'http'`. WS methods will be added when websocket-manager is implemented.

## File Structure

The mechanism is implemented by the following paths (under `client_web2/`):

```
src/
├── lib/logger/
│   └── index.ts                   # Re-export → request-logger (deprecated)
└── mechanisms/request-logger/
    ├── index.ts                   # Public exports (logger, types)
    ├── types.ts                   # ApiLogEntry, Logger, IoChannel
    ├── logger.ts                  # Ring buffer + HTTP/WS helpers
    └── logger.test.ts             # Vitest

plans/mechanisms/request-logger/   # Mechanism documentation (this folder)
```

## Design Decisions

- **Single logger singleton** — one ring buffer for all channels; consumers never instantiate their own loggers
- **Correlation IDs** — tie request → response → error for traceability in Docker dev sessions
- **Console in dev, structured objects** — JSON-serializable payloads for future log aggregation
- **200-entry cap** — balances debug usefulness with memory; matches project requirement
- **No silent failures** — liveblog-api and websocket-manager MUST call `logger.error` on catch/reject
- **Phase 0 location** — stub lives in `src/lib/logger/` until liveblog-api scaffold moves integration to `src/mechanisms/request-logger/`

## Implementation Approach

| Phase | Deliverable |
|-------|-------------|
| **0 (current)** | HTTP stub in `src/lib/logger/index.ts`, ring buffer, console output |
| **1a** | Create `src/mechanisms/request-logger/`, migrate stub, add `channel` field to entries |
| **1b** | Wire liveblog-api `apiRequest` wrapper — every fetch logged |
| **1c** | Add `wsEvent`, `wsConnection`; wire websocket-manager |
| **2** | Optional `LogPanel` dev UI (style-guide), export JSON, filter by channel |

Migration from legacy: no direct port — this is a new cross-cutting concern enforced in web2 only.

## Usage Examples

```typescript
import { logger } from '@/lib/logger';

// HTTP (called by liveblog-api — not by feature code directly)
async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `/api${path}`;
  const method = init?.method ?? 'GET';
  const id = logger.request(method, url);
  const started = performance.now();

  try {
    const res = await fetch(url, init);
    logger.response(id, res.status, Math.round(performance.now() - started), url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  } catch (err) {
    logger.error(id, err instanceof Error ? err.message : String(err), url);
    throw err;
  }
}
```

```typescript
// WebSocket (called by websocket-manager — Phase 1)
logger.wsConnection('connected', 'ws://localhost:5100');
const eventId = logger.wsEvent('in', 'blog', 'posts', '3 posts updated');
logger.wsConnection('disconnected', 'ws://localhost:5100');
```

```typescript
// Dev inspection
const recent = logger.getHistory();
console.table(recent.slice(0, 10));
```

## Error Handling Strategy

| Scenario | Behaviour |
|----------|-----------|
| HTTP 4xx/5xx | `logger.response` with status, then `logger.error` if thrown to caller |
| Network failure | `logger.error` with message; error re-thrown to TanStack Query / caller |
| WS disconnect | `wsConnection('disconnected', …)`; websocket-manager surfaces UI toast (legacy parity) |
| Logger internal failure | Must not throw — wrap push in try/catch, fallback to `console.error` |
| Buffer full | Silent eviction of oldest entry — no error |

Feature mechanisms MUST NOT catch and swallow errors without logging through this module (directly or via liveblog-api / websocket-manager).

## Related Mechanisms

- **liveblog-api** — primary HTTP consumer; wraps all `fetch` calls
- **websocket-manager** — primary WS consumer; logs connection lifecycle and events
- **style-guide** — required if dev-tools `LogPanel` UI is added

## Testing Requirements

| Level | Expectation |
|-------|-------------|
| **1 — Unit (Vitest)** | Ring buffer caps at 200; newest-first order; correlation id links request→response |
| **1 — Unit** | `error()` sets direction `'error'`; console.error invoked |
| **2 — Integration** | Mock fetch through liveblog-api stub; verify history contains request + response |
| **3 — Smoke (Docker)** | Login or blog list API call produces console log lines with correlation ids |

Verify no feature file imports `fetch` without passing through logged wrapper (grep audit in `/validate`).

## Legacy reference

- **HTTP patterns:** `superdesk-core/scripts/core/api` (imported in `client/app/scripts/index.js`)
- **WS patterns:** Superdesk notification service → `$rootScope.$on(EventNames.Connected|Disconnected, …)` in `client/app/scripts/index.js`
- **No legacy logger module** — web2 introduces structured logging as a new requirement

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
