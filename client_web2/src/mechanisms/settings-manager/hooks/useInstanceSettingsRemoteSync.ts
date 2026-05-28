import { useEffect, useRef } from 'react';
import { LiveblogWsEvent, useWsEvent } from '@/mechanisms/websocket-manager';

/**
 * Reload instance JSON editor when another client saves instance_settings.
 * Skips reload while the local form is dirty (legacy does not auto-overwrite Ace).
 */
export function useInstanceSettingsRemoteSync(
  reload: () => Promise<void>,
  isDirty: boolean,
) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  useWsEvent(LiveblogWsEvent.InstanceSettingsUpdated, () => {
    if (!isDirtyRef.current) {
      void reload();
    }
  });

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);
}
