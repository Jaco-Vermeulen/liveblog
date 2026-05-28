import { useCallback, useSyncExternalStore } from 'react';
import { wsManager } from '../manager';
import type { UseWebSocketOptions, UseWebSocketResult } from './types';

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketResult {
  const { enabled = true } = options;

  const state = useSyncExternalStore(
    (onStoreChange) => wsManager.onStateChange(onStoreChange),
    () => wsManager.getState(),
    () => wsManager.getState(),
  );

  const connect = useCallback(async () => {
    if (!enabled) return;
    await wsManager.connect(options.url);
  }, [enabled, options.url]);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
  }, []);

  return {
    state: enabled ? state : 'idle',
    isConnected: enabled && state === 'connected',
    connect,
    disconnect,
  };
}
