import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/mechanisms/auth-manager';
import { wsManager } from '../manager';
import type { WebSocketManager, WsConnectionState } from '../types';

export interface WebSocketContextValue {
  state: WsConnectionState;
  subscribe: WebSocketManager['subscribe'];
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionId) {
      wsManager.disconnect();
      return;
    }

    void wsManager.connect();

    return () => {
      wsManager.disconnect();
    };
  }, [state.isAuthenticated, state.sessionId]);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      get state() {
        return wsManager.getState();
      },
      subscribe: wsManager.subscribe.bind(wsManager),
    }),
    [],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketContext(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return ctx;
}
