import { useCallback, useRef, useState } from 'react';
import type { PreviewEmbedHandlers } from '../services/previewEmbedBridge';
import { usePreviewEmbedBridge } from '../hooks/usePreviewEmbedBridge';

export interface ThemeIframePreviewProps {
  src: string;
  handlers: PreviewEmbedHandlers | null;
  onNeedsFallback?: () => void;
}

/** Server-rendered liveblog embed with admin tools injected into theme post DOM. */
export function ThemeIframePreview({ src, handlers, onNeedsFallback }: ThemeIframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  const handleFallback = useCallback(() => {
    onNeedsFallback?.();
  }, [onNeedsFallback]);

  usePreviewEmbedBridge(iframeRef, handlers, handleFallback);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title="Lewendige blog met tema"
      className="lb-preview-theme-iframe"
      loading="lazy"
      onLoad={() => setLoaded(true)}
      data-loaded={loaded ? 'true' : 'false'}
    />
  );
}
