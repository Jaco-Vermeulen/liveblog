import { useEffect, useRef } from 'react';
import { activateEmbedMarkup } from '../services/iframelyEmbedJs';

export interface EmbedHtmlProps {
  html: string;
  className?: string;
}

/**
 * Renders provider HTML (legacy ItemEmbedGeneric uses jQuery .html()).
 * Activates iframely cards after paint (avoids DevTools-only race).
 */
export function EmbedHtml({ html, className }: EmbedHtmlProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !html.trim()) return;

    el.innerHTML = html;

    void activateEmbedMarkup(el);
  }, [html]);

  if (!html.trim()) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
