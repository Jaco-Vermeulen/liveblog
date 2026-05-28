import { useEffect, useState, type CSSProperties } from 'react';
import type { EmbedMeta } from '../types';

function loadInstagramLib(callback: () => void) {
  const id = 'instagram-js';
  if (document.getElementById(id)) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.id = id;
  script.src = 'https://www.instagram.com/embed.js';
  script.onload = () => callback();
  document.head.appendChild(script);
}

export interface EmbedInstagramProps {
  meta: EmbedMeta;
  style?: CSSProperties;
}

export function EmbedInstagram({ meta, style }: EmbedInstagramProps) {
  const [ready, setReady] = useState(false);
  const url = meta.original_url ?? meta.url ?? '';

  useEffect(() => {
    loadInstagramLib(() => {
      setReady(true);
      const instgrm = (window as Window & { instgrm?: { Embeds?: { process: () => void } } })
        .instgrm;
      instgrm?.Embeds?.process();
    });
  }, [url, meta.show_embed_description]);

  if (!url) return null;

  const captioned = Boolean(meta.show_embed_description);

  return (
    <div className="m-embed-instagram">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={style ?? { maxWidth: 550, width: '100%' }}
        {...(captioned ? { 'data-instgrm-captioned': '' } : {})}
      >
        {!ready && (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View post on Instagram
          </a>
        )}
      </blockquote>
    </div>
  );
}
