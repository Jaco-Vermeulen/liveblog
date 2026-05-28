# WebSocket Manager

Superdesk JSON WebSocket client for Liveblog real-time notifications. For change history and file lists, see [CHANGELOG.md](CHANGELOG.md).

## Overview

Manages the WebSocket connection to the Liveblog notification server (`ws://localhost:5100`), parses Superdesk `{ event, extra }` messages, maps them to typed React callbacks (`LiveblogWsEvent`), and logs all connection lifecycle and inbound traffic via **request-logger**. **No raw `WebSocket` outside this mechanism.**

> **Protocol note:** The server process is named `wamp` in `server/Procfile`, but the **client** uses plain WebSocket + JSON (superdesk-client-core v1.17 `WebSocketProxy`), not Autobahn WAMP.

## Status

**Phase 1 implemented (2026-05-26)** — `src/mechanisms/websocket-manager/`; Superdesk JSON WebSocket protocol (same as legacy `WebSocketProxy` in superdesk-client-core v1.17, not Autobahn). Env: `VITE_LIVEBLOG_WS_URL`. Editor consumes `posts` / `blog` / embed errors via `useEditorWebSocket`.

## Purpose

- Maintain a single authenticated WebSocket session to the notification server (after auth-manager session)
- Expose typed event subscriptions for blog/post real-time updates
- Map legacy `EventNames` from `liveblog-common/constants.ts` to React hooks
- Log connect, disconnect, subscribe, and inbound events via **request-logger**
- Surface connection state for UI toasts (Connected / Disconnected parity with legacy)

## Current Implementation

### Legacy (`client/`)

- **WebSocket client:** Superdesk `WebSocketProxy` (superdesk-client-core v1.17) — `new WebSocket(config.server.ws)`; parses JSON `{ event, extra }`; `$rootScope.$broadcast(msg.event, msg.extra)`
- **Event dispatch:** Server messages translated to `$rootScope.$broadcast(EventNames.*, data)` and `$rootScope.$on` listeners
- **Connection UI:** `client/app/scripts/index.js` — `EventNames.Connected` / `EventNames.Disconnected` trigger notify toasts when session active
- **Feature listeners:**
  - `liveblog-edit/blog.service.js` — `EventNames.Blog` (public URL on publish), `EventNames.EmbedGenerationError`
  - `liveblog-edit/controllers/blog-edit.js` — `EventNames.Posts`, `EventNames.RemoveTimelinePost`
- **Constants:** `client/app/scripts/liveblog-common/constants.ts` — `EventNames` enum

### Web2 (`client_web2/`)

- **Env:** `VITE_LIVEBLOG_WS_URL=ws://localhost:5100` in `.env.example`
- **Mechanism:** `src/mechanisms/websocket-manager/` — `wsManager`, `WebSocketProvider`, hooks
- **Logger:** `request-logger` `wsEvent` / `wsConnection` wired in `wamp-client.ts`

## Liveblog server / API

### WebSocket endpoint

| Setting | Value |
|---------|-------|
| URL (dev) | `ws://localhost:5100` |
| Env var | `VITE_LIVEBLOG_WS_URL` |
| Protocol | JSON over WebSocket (`{ event, extra }`) |
| Server process | `wamp: python3 -u ws.py` (see `server/Procfile`) |
| Legacy config | `grunt server --ws='ws://localhost:5100'` |

### Event catalog (legacy `EventNames`)

Mapped from `client/app/scripts/liveblog-common/constants.ts` and server publishers:

| Event name | Legacy constant | Payload (typical) | Consumer behaviour |
|------------|-----------------|-------------------|-------------------|
| `connected` | `EventNames.Connected` | none | Dismiss disconnect toast; show reconnect success |
| `disconnected` | `EventNames.Disconnected` | none | Show "attempting to reconnect" toast (when session active) |
| `blog` | `EventNames.Blog` | `{ blog_id, published, public_url, … }` | Update blog public URL after first publish |
| `posts` | `EventNames.Posts` | `{ posts: Post[] }` | Merge updated posts into editor state |
| `embed_generation_error` | `EventNames.EmbedGenerationError` | `{ blog_id, error, theme_name }` | Show throttled error notify (3h localStorage gate) |
| `removing_timeline_post` | `EventNames.RemoveTimelinePost` | `{ post: Post }` | Reset editor if deleted post is being edited |
| `instance_settings:updated` | `EventNames.InstanceSettingsUpdated` | settings delta | Refresh feature flags (Phase 5+) |

Server-side example: `server/liveblog/blogs/tasks.py` publishes `embed_generation_error` on embed failure.

### REST complement

WebSocket delivers push notifications; initial data loads still use **liveblog-api**. websocket-manager does NOT replace REST reads.

## Dependencies

- **request-logger** (REQUIRED) — logs connection state and every inbound/outbound WAMP message summary
- **auth-manager** — session must be established before WAMP auth (legacy: notification connects after Superdesk session)

## Dependents

- **editor-manager** (primary) — post updates, timeline removals, embed errors, blog publish URL
- **blog-list-manager** — optional live list updates (Phase 2+)
- **settings-manager** — `instance_settings:updated` (Phase 5)
- App shell — connection status toasts (legacy parity with `client/app/scripts/index.js`)

## Technical Specification

### Connection types

```typescript
export type WsConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

/** Legacy EventNames — stable string values from server */
export enum LiveblogWsEvent {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Blog = 'blog',
  Posts = 'posts',
  EmbedGenerationError = 'embed_generation_error',
  RemoveTimelinePost = 'removing_timeline_post',
  InstanceSettingsUpdated = 'instance_settings:updated',
}

export interface BlogEventPayload {
  blog_id: string;
  published?: number;
  public_url?: string;
}

export interface PostsEventPayload {
  posts: import('@/mechanisms/liveblog-api/types').Post[];
}

export interface EmbedGenerationErrorPayload {
  blog_id: string;
  error: string;
  theme_name?: string;
}

export interface RemoveTimelinePostPayload {
  post: import('@/mechanisms/liveblog-api/types').Post;
}

export type LiveblogWsPayloadMap = {
  [LiveblogWsEvent.Blog]: BlogEventPayload;
  [LiveblogWsEvent.Posts]: PostsEventPayload;
  [LiveblogWsEvent.EmbedGenerationError]: EmbedGenerationErrorPayload;
  [LiveblogWsEvent.RemoveTimelinePost]: RemoveTimelinePostPayload;
  [LiveblogWsEvent.Connected]: undefined;
  [LiveblogWsEvent.Disconnected]: undefined;
  [LiveblogWsEvent.InstanceSettingsUpdated]: { settings?: Record<string, unknown> };
};
```

### Manager service

```typescript
export interface WebSocketManager {
  /** Current connection state */
  getState(): WsConnectionState;

  /** Open WAMP session (idempotent) */
  connect(url?: string): Promise<void>;

  /** Close session and clear subscriptions */
  disconnect(): void;

  /** Subscribe to typed event; returns unsubscribe function */
  subscribe<E extends LiveblogWsEvent>(
    event: E,
    handler: (payload: LiveblogWsPayloadMap[E]) => void,
  ): () => void;

  /** Subscribe to all events (debug) */
  subscribeAll(handler: (event: LiveblogWsEvent, payload: unknown) => void): () => void;
}

export const wsManager: WebSocketManager;
```

### React hooks

```typescript
export interface UseWebSocketOptions {
  /** Auto-connect on mount (default true when authenticated) */
  enabled?: boolean;
  url?: string;
}

export interface UseWebSocketResult {
  state: WsConnectionState;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWebSocket(options?: UseWebSocketOptions): UseWebSocketResult;

export function useWsEvent<E extends LiveblogWsEvent>(
  event: E,
  handler: (payload: LiveblogWsPayloadMap[E]) => void,
  options?: { enabled?: boolean },
): void;
```

### Context provider (app shell)

```typescript
export interface WebSocketContextValue {
  state: WsConnectionState;
  subscribe: WebSocketManager['subscribe'];
}

export function WebSocketProvider(props: { children: React.ReactNode }): JSX.Element;
export function useWebSocketContext(): WebSocketContextValue;
```

### Logging contract

| Action | Logger call |
|--------|-------------|
| Connect attempt | `logger.wsConnection('connected', url)` on success |
| Disconnect / error | `logger.wsConnection('disconnected', url)` |
| Inbound event | `logger.wsEvent('in', topic, eventName, summary)` |
| Outbound subscribe | `logger.wsEvent('out', topic, 'SUBSCRIBE', eventName)` |

## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
src/mechanisms/websocket-manager/
├── index.ts
├── types.ts                       # LiveblogWsEvent, payload map, WsConnectionState
├── events.ts                      # Re-export LiveblogWsEvent
├── wamp-client.ts                 # createSuperdeskWsClient (JSON protocol; name retained)
├── manager.ts                     # wsManager singleton, closeMode, reconnect
├── manager.test.ts
├── wamp-client.test.ts
├── components/
│   └── ConnectionBanner.tsx       # LbAlert disconnect/reconnect (Afrikaans)
├── context/
│   └── WebSocketProvider.tsx      # Auth-gated connect/disconnect
└── hooks/
    ├── types.ts
    ├── useWebSocket.ts            # useSyncExternalStore on wsManager state
    └── useWsEvent.ts              # Typed subscribe in React
```

Supporting:

```
.env.example                         # VITE_LIVEBLOG_WS_URL=ws://localhost:5100
scripts/smoke-websocket.mjs          # Level 2 smoke — connect to :5100
src/App.tsx                          # WebSocketProvider inside ProtectedRoute
src/mechanisms/navigation-manager/components/AppShell.tsx  # ConnectionBanner
src/mechanisms/editor-manager/hooks/useEditorWebSocket.ts  # Editor consumer
```

## Design Decisions

- **Single WebSocket session** — `wsManager` singleton; one connection app-wide (legacy Superdesk singleton)
- **No raw WebSocket** — all access through `wamp-client.ts` inside this mechanism
- **Superdesk wire format** — inbound `{ event, extra }`; synthetic `connected` / `disconnected` from socket lifecycle
- **Legacy event names unchanged** — same strings as `EventNames` in `liveblog-common/constants.ts`
- **Intentional close (`closeMode`)** — `replace` when swapping sockets; `shutdown` on logout; neither schedules reconnect nor emits disconnect UI events
- **Idempotent `connect()`** — no-op if already connected to the same URL
- **Reconnect after 5s** — `RECONNECT_INTERVAL_MS` matches legacy; state stays `disconnected` until timer (then `reconnecting` → `connecting` → `connected`)
- **Auth-gated connect** — `WebSocketProvider` uses `useAuth().state.sessionId`
- **Banner debounce** — 800ms before disconnect warning (avoids layout flicker)
- **Editor posts debounce** — 400ms on timeline refetch from `posts` events
- **REST for reads, WS for push** — initial loads via **liveblog-api** only

## Implementation Approach

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **1** | `wamp-client.ts` + `manager.ts` + logger | Done |
| **1** | `WebSocketProvider`, hooks, `ConnectionBanner` | Done |
| **1** | Editor `useEditorWebSocket` (replaces stub) | Done |
| **1 fix** | Reconnect loop / UI flash (`closeMode`, debounce) | Done (T-ws-12–16) |
| **3+** | `instance_settings:updated` in settings-manager | T-ws-9 |
| **3+** | Blog-list live updates | T-ws-10 |

Migration workflow:

1. Read legacy `$rootScope.$on(EventNames.*)` in target feature module
2. Replace with `useWsEvent(LiveblogWsEvent.*, handler)`
3. Smoke against Docker stack with two browser tabs to verify push

## Components

| Component | Purpose | Location | Styling |
|-----------|---------|----------|---------|
| `ConnectionBanner` | Disconnect warning + reconnect success (Afrikaans) | `components/ConnectionBanner.tsx` | `LbAlert` (style-guide) |
| `WebSocketProvider` | Auth-gated `wsManager.connect()` | `context/WebSocketProvider.tsx` | — |

Rendered in **navigation-manager** `AppShell` (above `<Outlet />`). Legacy parity: `client/app/scripts/index.js` Connected/Disconnected toasts.

## Usage Examples

```tsx
import { WebSocketProvider } from '@/mechanisms/websocket-manager/context/WebSocketProvider';
import { useWebSocket } from '@/mechanisms/websocket-manager/hooks/useWebSocket';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <ConnectionBanner />
      {children}
    </WebSocketProvider>
  );
}

function ConnectionBanner() {
  const { state, isConnected } = useWebSocket({ enabled: true });
  if (isConnected) return null;
  return <p className="text-mar-orange">Notification server: {state}…</p>;
}
```

```tsx
import { useWsEvent, LiveblogWsEvent } from '@/mechanisms/websocket-manager';
import type { PostsEventPayload } from '@/mechanisms/websocket-manager/types';

export function useLivePostSync(onPosts: (data: PostsEventPayload) => void) {
  useWsEvent(LiveblogWsEvent.Posts, onPosts, { enabled: true });
}
```

```typescript
// Non-React service code
import { wsManager, LiveblogWsEvent } from '@/mechanisms/websocket-manager';

await wsManager.connect(import.meta.env.VITE_LIVEBLOG_WS_URL);

const unsub = wsManager.subscribe(LiveblogWsEvent.Blog, (data) => {
  if (data.published === 1) console.log('Public URL:', data.public_url);
});

// later
unsub();
wsManager.disconnect();
```

## Error Handling Strategy

| Scenario | Behaviour |
|----------|-----------|
| WS server down on startup | `state: 'disconnected'`; retry with backoff; log each attempt |
| Mid-session disconnect | `LiveblogWsEvent.Disconnected`; show legacy-style toast; auto-reconnect |
| Malformed payload | Log warning via `logger.error`; do not crash subscribers |
| Auth expired | `disconnect()` on logout; auth-manager 401 via REST; reconnect after re-login |
| Intentional socket replace | `closeMode: 'replace'` — no disconnect event, no reconnect timer |
| Subscribe failure | Log error; surface in dev console; feature degrades to REST polling (editor only, with **BOLD WARNING** in UI if WS unavailable) |

If WebSocket is unavailable, features MAY fall back to REST polling only as a last resort — must log a visible warning, never fail silently.

## Related Mechanisms

- **request-logger** (REQUIRED) — all WS I/O logged
- **liveblog-api** — REST complement for initial loads and mutations
- **auth-manager** — session required before WebSocket connect
- **editor-manager** — primary event consumer (Posts, Blog, EmbedGenerationError, RemoveTimelinePost)
- **style-guide** — REQUIRED for connection toast UI in app shell

## Testing Requirements

| Level | Expectation |
|-------|-------------|
| **1 — Unit (Vitest)** | Mock WebSocket; subscribe/unsubscribe; state transitions; no reconnect loop on replace |
| **1 — Unit** | Payload typing for each `LiveblogWsEvent` |
| **2 — Integration** | Docker WS on :5100; connect after login; receive logged `connected` entry |
| **3 — Smoke** | Open editor; verify disconnect toast when stopping `wamp` process; reconnect toast on restart |

Compare event handling with legacy: `client/app/scripts/index.js` (Connected/Disconnected), `liveblog-edit/blog.service.js`, `liveblog-edit/controllers/blog-edit.js`.

## Legacy reference

- **Event constants:** `client/app/scripts/liveblog-common/constants.ts` — `EventNames` enum
- **Connection toasts:** `client/app/scripts/index.js` — `$rootScope.$on(EventNames.Connected|Disconnected)`
- **Blog / embed:** `client/app/scripts/liveblog-edit/blog.service.js`
- **Posts / timeline:** `client/app/scripts/liveblog-edit/controllers/blog-edit.js`
- **Local broadcast:** `client/app/scripts/liveblog-edit/directives/post.js` — `$broadcast(EventNames.RemoveTimelinePost)` (client-initiated, not from server)
- **Dev WS URL:** `client/webpack.config.js`, `client/tasks/options/template.js` — default `ws://localhost:5100`
- **Server:** `server/ws.py`, `server/Procfile` — WAMP on port 5100

## Tasks

See [TASKS.md](TASKS.md) for implementation tasks.
