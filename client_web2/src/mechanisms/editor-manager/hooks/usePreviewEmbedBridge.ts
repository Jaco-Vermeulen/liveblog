import { useEffect, useRef, type RefObject } from 'react';
import type { PreviewEmbedHandlers } from '../services/previewEmbedBridge';
import {
  canAccessIframeDocument,
  syncEmbedEditorTools,
} from '../services/previewEmbedBridge';

/** Wire admin toolbars into a same-origin theme embed iframe. */
export function usePreviewEmbedBridge(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  handlers: PreviewEmbedHandlers | null,
  onFallback?: () => void,
): void {
  const teardownRef = useRef<(() => void) | null>(null);
  const fallbackCalledRef = useRef(false);

  useEffect(() => {
    teardownRef.current?.();
    teardownRef.current = null;

    if (!handlers) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const attach = () => {
      if (!canAccessIframeDocument(iframe)) {
        if (!fallbackCalledRef.current) {
          fallbackCalledRef.current = true;
          onFallback?.();
        }
        return;
      }
      const doc = iframe.contentDocument;
      if (!doc?.body) return;
      teardownRef.current?.();
      teardownRef.current = syncEmbedEditorTools(doc, handlers);
    };

    const onLoad = () => {
      fallbackCalledRef.current = false;
      attach();
    };

    iframe.addEventListener('load', onLoad);
    onLoad();

    return () => {
      iframe.removeEventListener('load', onLoad);
      teardownRef.current?.();
      teardownRef.current = null;
    };
  }, [iframeRef, handlers, onFallback]);
}
