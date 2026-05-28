import type { WsConnectionState } from '../types';

export interface UseWebSocketOptions {
  /** When false, reports idle state and skips auto-connect from provider */
  enabled?: boolean;
  url?: string;
}

export interface UseWebSocketResult {
  state: WsConnectionState;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export interface UseWsEventOptions {
  enabled?: boolean;
}
