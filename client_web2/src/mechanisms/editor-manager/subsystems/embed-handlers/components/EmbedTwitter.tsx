import { useLayoutEffect, useRef, useState } from 'react';
import { TwitterEmbed } from 'react-social-media-embed';

export interface EmbedTwitterProps {
  url: string;
  linkText?: string;
}

/**
 * Twitter widget needs a non-zero-width container (hidden until layout — fixes DevTools-only render).
 */
export function EmbedTwitter({ url, linkText }: EmbedTwitterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const trimmed = url.trim();

  useLayoutEffect(() => {
    setLayoutReady(false);
    const node = containerRef.current;
    if (!node) return;

    const tryReady = () => {
      if (node.offsetWidth > 0) {
        setLayoutReady(true);
        return true;
      }
      return false;
    };

    if (tryReady()) return;

    const observer = new ResizeObserver(() => {
      if (tryReady()) observer.disconnect();
    });
    observer.observe(node);

    const intervalId = window.setInterval(() => {
      if (tryReady()) window.clearInterval(intervalId);
    }, 50);

    const timeoutId = window.setTimeout(() => {
      setLayoutReady(true);
    }, 500);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [trimmed]);

  if (!trimmed) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="m-embed-twitter"
      style={{ maxWidth: 550, width: '100%', minWidth: 280, minHeight: layoutReady ? undefined : 120 }}
    >
      {layoutReady ? (
        <TwitterEmbed key={trimmed} url={trimmed} linkText={linkText} width="100%" />
      ) : (
        <span className="text-sm text-[var(--color-mar-muted)]">Laai X-inbedding…</span>
      )}
    </div>
  );
}
