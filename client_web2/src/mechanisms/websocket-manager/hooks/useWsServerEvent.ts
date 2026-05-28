import { useEffect, useRef } from 'react';
import { wsManager } from '../manager';

export function useWsServerEvent(
  event: string,
  handler: (extra: unknown) => void,
  enabled = true,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    return wsManager.subscribeServerEvent(event, (extra) => {
      handlerRef.current(extra);
    });
  }, [event, enabled]);
}
