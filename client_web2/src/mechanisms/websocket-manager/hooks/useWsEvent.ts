import { useEffect, useRef } from 'react';
import { wsManager } from '../manager';
import type { LiveblogWsEvent, LiveblogWsPayloadMap } from '../types';
import type { UseWsEventOptions } from './types';

export function useWsEvent<E extends LiveblogWsEvent>(
  event: E,
  handler: (payload: LiveblogWsPayloadMap[E]) => void,
  options: UseWsEventOptions = {},
): void {
  const { enabled = true } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    return wsManager.subscribe(event, (payload) => {
      handlerRef.current(payload);
    });
  }, [event, enabled]);
}
