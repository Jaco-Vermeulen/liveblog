import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { canAccessIframeDocument } from '../services/previewEmbedBridge';
import { ensureDraftPreviewHost, removeDraftPreviewHost } from '../services/draftPreviewHost';

export interface DraftPreviewPortalProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  enabled: boolean;
  children: ReactNode;
}

/** Renders the composer draft inside the theme iframe so it inherits real preview styling. */
export function DraftPreviewPortal({ iframeRef, enabled, children }: DraftPreviewPortalProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHost(null);
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    const attach = () => {
      if (!canAccessIframeDocument(iframe)) {
        setHost(null);
        return;
      }
      const doc = iframe.contentDocument;
      if (!doc?.body) return;
      setHost(ensureDraftPreviewHost(doc));
    };

    const onLoad = () => attach();
    iframe.addEventListener('load', onLoad);
    attach();

    return () => {
      iframe.removeEventListener('load', onLoad);
      try {
        const doc = iframe.contentDocument;
        if (doc) removeDraftPreviewHost(doc);
      } catch {
        /* cross-origin teardown */
      }
      setHost(null);
    };
  }, [iframeRef, enabled]);

  if (!enabled || !host || !children) return null;
  return createPortal(children, host);
}
