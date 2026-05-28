/**
 * Superdesk notification WebSocket client (JSON messages, not WAMP).
 * Legacy: superdesk-client-core v1.17 `WebSocketProxy` — `ws.onmessage` parses
 * `{ event, extra }` and broadcasts to Angular `$rootScope`.
 */
import { logger } from '@/mechanisms/request-logger';
import type { SuperdeskWsMessage } from './types';

export const RECONNECT_INTERVAL_MS = 5000;

export function getDefaultWsUrl(): string {
  const fromEnv = import.meta.env.VITE_LIVEBLOG_WS_URL as string | undefined;
  return fromEnv?.trim() || 'ws://localhost:5100';
}

export type WsClientCallbacks = {
  onOpen: () => void;
  onClose: () => void;
  onMessage: (message: SuperdeskWsMessage) => void;
  onError: (error: Event) => void;
};

export interface SuperdeskWsClient {
  readonly url: string;
  connect(): void;
  close(): void;
  getReadyState(): number;
}

export function createSuperdeskWsClient(
  url: string,
  callbacks: WsClientCallbacks,
): SuperdeskWsClient {
  let socket: WebSocket | null = null;

  const bind = (ws: WebSocket) => {
    ws.onopen = () => {
      logger.wsConnection('connected', url);
      callbacks.onOpen();
    };

    ws.onclose = () => {
      logger.wsConnection('disconnected', url);
      callbacks.onClose();
    };

    ws.onerror = (event) => {
      logger.error(crypto.randomUUID(), 'WebSocket error', url);
      callbacks.onError(event);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as SuperdeskWsMessage;
        if (!message?.event) {
          console.warn('[websocket-manager] message missing event field', message);
          return;
        }
        const summary =
          typeof message.extra === 'object' && message.extra !== null
            ? Object.keys(message.extra as object).join(',')
            : undefined;
        logger.wsEvent('in', url, message.event, summary);
        callbacks.onMessage(message);
      } catch (err) {
        console.warn('[websocket-manager] failed to parse message', err, event.data);
      }
    };
  };

  return {
    url,
    connect() {
      if (socket && socket.readyState === WebSocket.OPEN) {
        return;
      }
      if (socket && socket.readyState === WebSocket.CONNECTING) {
        return;
      }
      socket?.close();
      socket = new WebSocket(url);
      bind(socket);
    },
    close() {
      socket?.close();
      socket = null;
    },
    getReadyState() {
      return socket?.readyState ?? WebSocket.CLOSED;
    },
  };
}
