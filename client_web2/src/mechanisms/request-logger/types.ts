export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogDirection = 'request' | 'response' | 'error' | 'event';

export type IoChannel = 'http' | 'websocket';

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  channel: IoChannel;
  direction: LogDirection;
  method?: string;
  url?: string;
  status?: number;
  durationMs?: number;
  message?: string;
  payloadSize?: number;
}

export interface Logger {
  request(method: string, url: string): string;
  response(id: string, status: number, durationMs: number, url?: string): void;
  error(id: string, message: string, url?: string): void;
  wsEvent(
    direction: 'in' | 'out',
    topic: string,
    eventName: string,
    summary?: string,
  ): string;
  wsConnection(state: 'connected' | 'disconnected', url: string): void;
  getHistory(): readonly ApiLogEntry[];
  clearHistory(): void;
}
