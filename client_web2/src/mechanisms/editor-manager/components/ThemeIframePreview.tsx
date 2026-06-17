import { forwardRef, useCallback, useRef, useState } from 'react';
import type { PreviewEmbedHandlers } from '../services/previewEmbedBridge';
import { usePreviewEmbedBridge } from '../hooks/usePreviewEmbedBridge';

export interface ThemeIframePreviewProps {
  src: string;
  handlers: PreviewEmbedHandlers | null;
  onNeedsFallback?: () => void;
}

/** Server-rendered liveblog embed with admin tools injected into theme post DOM. */
export const ThemeIframePreview = forwardRef<HTMLIFrameElement, ThemeIframePreviewProps>(
  function ThemeIframePreview({ src, handlers, onNeedsFallback }, forwardedRef) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loaded, setLoaded] = useState(false);

    const handleFallback = useCallback(() => {
      onNeedsFallback?.();
    }, [onNeedsFallback]);

    const setIframeRef = useCallback(
      (node: HTMLIFrameElement | null) => {
        iframeRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    usePreviewEmbedBridge(iframeRef, handlers, handleFallback);

    return (
      <iframe
        ref={setIframeRef}
        src={src}
        title="Lewendige blog met tema"
        className="lb-preview-theme-iframe"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        data-loaded={loaded ? 'true' : 'false'}
      />
    );
  },
);
