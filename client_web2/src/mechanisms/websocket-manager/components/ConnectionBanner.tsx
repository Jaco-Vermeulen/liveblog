import { useEffect, useRef, useState } from 'react';
import { AF } from '@/copy';
import { LbAlert } from '@/components/ui/LbAlert';
import { LiveblogWsEvent } from '../events';
import { useWebSocket } from '../hooks/useWebSocket';
import { useWsEvent } from '../hooks/useWsEvent';

const DISCONNECT_BANNER_DELAY_MS = 800;

/**
 * Legacy parity: `client/app/scripts/index.js` — show disconnect warning when session
 * active; dismiss and show success on reconnect after a prior disconnect.
 */
export function ConnectionBanner() {
  const { state } = useWebSocket();
  const hadDisconnect = useRef(false);
  const [showReconnectSuccess, setShowReconnectSuccess] = useState(false);
  const [showDisconnectWarning, setShowDisconnectWarning] = useState(false);

  useWsEvent(LiveblogWsEvent.Disconnected, () => {
    hadDisconnect.current = true;
    setShowReconnectSuccess(false);
  });

  useWsEvent(LiveblogWsEvent.Connected, () => {
    setShowDisconnectWarning(false);
    if (hadDisconnect.current) {
      hadDisconnect.current = false;
      setShowReconnectSuccess(true);
    }
  });

  useEffect(() => {
    if (state !== 'disconnected' && state !== 'reconnecting') {
      setShowDisconnectWarning(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowDisconnectWarning(true);
    }, DISCONNECT_BANNER_DELAY_MS);

    return () => {
      clearTimeout(timer);
      setShowDisconnectWarning(false);
    };
  }, [state]);

  useEffect(() => {
    if (!showReconnectSuccess) return;
    const timer = setTimeout(() => setShowReconnectSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [showReconnectSuccess]);

  if (showReconnectSuccess) {
    return (
      <LbAlert variant="info" className="mb-4">
        {AF.ws.connected}
      </LbAlert>
    );
  }

  if (showDisconnectWarning) {
    return (
      <LbAlert variant="warning" className="mb-4">
        {AF.ws.disconnected}
      </LbAlert>
    );
  }

  return null;
}
