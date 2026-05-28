import { useEffect } from 'react';
import { ensureIframelyEmbedJs } from '../subsystems/embed-handlers/services/iframelyEmbedJs';

/**
 * Preload Iframely embed.js on editor routes (legacy themes load this in template-embed-utils.html).
 */
export function useEditorEmbedRuntime(): void {
  useEffect(() => {
    void ensureIframelyEmbedJs().catch((err) => {
      console.warn('[embed-handlers] Iframely embed.js preload failed', err);
    });
  }, []);
}
