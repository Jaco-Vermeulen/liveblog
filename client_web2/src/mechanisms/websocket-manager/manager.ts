import {
  createSuperdeskWsClient,
  getDefaultWsUrl,
  RECONNECT_INTERVAL_MS,
  type SuperdeskWsClient,
} from './wamp-client';
import {
  LiveblogWsEvent,
  type LiveblogWsPayloadMap,
  type SuperdeskWsMessage,
  type WebSocketManager,
  type WsConnectionState,
} from './types';

type Handler = (payload: unknown) => void;

function isLiveblogWsEvent(event: string): event is LiveblogWsEvent {
  return Object.values(LiveblogWsEvent).includes(event as LiveblogWsEvent);
}

type CloseMode = 'replace' | 'shutdown';

class WebSocketManagerImpl implements WebSocketManager {
  private state: WsConnectionState = 'idle';
  private client: SuperdeskWsClient | null = null;
  private url = getDefaultWsUrl();
  private shouldRun = false;
  /** Suppress disconnect/reconnect when we close the socket on purpose */
  private closeMode: CloseMode | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly handlers = new Map<string, Set<Handler>>();
  private readonly serverEventHandlers = new Map<string, Set<Handler>>();
  private readonly allHandlers = new Set<(event: LiveblogWsEvent, payload: unknown) => void>();
  private readonly stateListeners = new Set<() => void>();

  getState(): WsConnectionState {
    return this.state;
  }

  onStateChange(listener: () => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private setState(next: WsConnectionState) {
    if (this.state === next) return;
    this.state = next;
    for (const listener of this.stateListeners) {
      listener();
    }
  }

  private emit<E extends LiveblogWsEvent>(event: E, payload: LiveblogWsPayloadMap[E]) {
    const set = this.handlers.get(event);
    if (set) {
      for (const handler of set) {
        try {
          handler(payload);
        } catch (err) {
          console.error('[websocket-manager] handler error', event, err);
        }
      }
    }
    if (isLiveblogWsEvent(event)) {
      for (const handler of this.allHandlers) {
        try {
          handler(event, payload);
        } catch (err) {
          console.error('[websocket-manager] subscribeAll handler error', event, err);
        }
      }
    }
  }

  private dispatchServerMessage(message: SuperdeskWsMessage) {
    const serverSet = this.serverEventHandlers.get(message.event);
    if (serverSet) {
      for (const handler of serverSet) {
        try {
          handler(message.extra);
        } catch (err) {
          console.error('[websocket-manager] server event handler error', message.event, err);
        }
      }
    }

    if (!isLiveblogWsEvent(message.event)) {
      return;
    }
    this.emit(message.event, message.extra as LiveblogWsPayloadMap[typeof message.event]);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect() {
    if (!this.shouldRun || this.reconnectTimer !== null) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldRun) {
        this.setState('reconnecting');
        this.openSocket();
      }
    }, RECONNECT_INTERVAL_MS);
  }

  private handleSocketClose() {
    if (this.closeMode) {
      this.closeMode = null;
      return;
    }

    this.client = null;
    this.setState('disconnected');
    this.emit(LiveblogWsEvent.Disconnected, undefined);
    if (this.shouldRun) {
      this.scheduleReconnect();
    }
  }

  private replaceSocket() {
    if (!this.client) return;
    this.closeMode = 'replace';
    this.client.close();
    this.client = null;
  }

  private openSocket() {
    this.clearReconnectTimer();
    this.replaceSocket();

    if (!this.shouldRun) {
      return;
    }

    this.setState('connecting');

    this.client = createSuperdeskWsClient(this.url, {
      onOpen: () => {
        this.setState('connected');
        this.emit(LiveblogWsEvent.Connected, undefined);
      },
      onClose: () => {
        this.handleSocketClose();
      },
      onMessage: (message) => this.dispatchServerMessage(message),
      onError: () => {
        /* close handler drives reconnect */
      },
    });

    this.client.connect();
  }

  async connect(url?: string): Promise<void> {
    const nextUrl = url?.trim() || getDefaultWsUrl();
    if (
      this.shouldRun &&
      this.url === nextUrl &&
      this.client &&
      (this.state === 'connected' || this.state === 'connecting')
    ) {
      return;
    }

    this.url = nextUrl;
    this.shouldRun = true;
    this.openSocket();
  }

  disconnect(): void {
    this.shouldRun = false;
    this.clearReconnectTimer();
    if (this.client) {
      this.closeMode = 'shutdown';
      this.client.close();
      this.client = null;
    }
    this.setState('idle');
  }

  subscribe<E extends LiveblogWsEvent>(
    event: E,
    handler: (payload: LiveblogWsPayloadMap[E]) => void,
  ): () => void {
    const wrapped = handler as Handler;
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(wrapped);
    return () => {
      set?.delete(wrapped);
      if (set?.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  subscribeAll(handler: (event: LiveblogWsEvent, payload: unknown) => void): () => void {
    this.allHandlers.add(handler);
    return () => this.allHandlers.delete(handler);
  }

  subscribeServerEvent(event: string, handler: (extra: unknown) => void): () => void {
    const wrapped = handler as Handler;
    let set = this.serverEventHandlers.get(event);
    if (!set) {
      set = new Set();
      this.serverEventHandlers.set(event, set);
    }
    set.add(wrapped);
    return () => {
      set?.delete(wrapped);
      if (set?.size === 0) {
        this.serverEventHandlers.delete(event);
      }
    };
  }
}

export const wsManager: WebSocketManager = new WebSocketManagerImpl();

/** Test-only: reset connection between tests */
export function __resetWsManagerForTests() {
  wsManager.disconnect();
}
