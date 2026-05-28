import type { ApiLogEntry, IoChannel, LogDirection, Logger } from './types';

const MAX_HISTORY = 200;

const logHistory: ApiLogEntry[] = [];

function push(entry: ApiLogEntry) {
  try {
    logHistory.unshift(entry);
    if (logHistory.length > MAX_HISTORY) {
      logHistory.pop();
    }

    const channelLabel = entry.channel === 'websocket' ? 'liveblog-ws' : 'liveblog-api';
    const prefix = `[${channelLabel}:${entry.direction}]`;
    const payload = { ...entry };

    if (entry.direction === 'error') {
      console.error(prefix, payload);
    } else {
      console.info(prefix, payload);
    }
  } catch (err) {
    console.error('[request-logger] failed to record entry', err, entry);
  }
}

function createEntry(
  channel: IoChannel,
  direction: LogDirection,
  partial: Omit<ApiLogEntry, 'id' | 'timestamp' | 'channel' | 'direction'>,
): ApiLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    channel,
    direction,
    ...partial,
  };
}

export const logger: Logger = {
  request(method: string, url: string): string {
    const entry = createEntry('http', 'request', { method, url });
    push(entry);
    return entry.id;
  },

  response(id: string, status: number, durationMs: number, url?: string) {
    push({
      id,
      timestamp: new Date().toISOString(),
      channel: 'http',
      direction: 'response',
      status,
      durationMs,
      url,
    });
  },

  error(id: string, message: string, url?: string) {
    push({
      id,
      timestamp: new Date().toISOString(),
      channel: 'http',
      direction: 'error',
      message,
      url,
    });
  },

  wsEvent(direction: 'in' | 'out', topic: string, eventName: string, summary?: string) {
    const entry = createEntry('websocket', 'event', {
      method: direction === 'in' ? 'IN' : 'OUT',
      url: topic,
      message: summary ?? eventName,
    });
    push(entry);
    return entry.id;
  },

  wsConnection(state: 'connected' | 'disconnected', url: string) {
    const entry = createEntry('websocket', 'event', {
      method: state.toUpperCase(),
      url,
      message: `WebSocket ${state}`,
    });
    push(entry);
  },

  getHistory(): readonly ApiLogEntry[] {
    return logHistory;
  },

  clearHistory() {
    logHistory.length = 0;
  },
};

/** Test-only: reset buffer between tests */
export function __resetLoggerForTests() {
  logHistory.length = 0;
}
