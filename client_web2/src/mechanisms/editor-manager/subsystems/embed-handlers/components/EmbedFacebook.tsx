import { useEffect, useState, type CSSProperties } from 'react';
import type { EmbedMeta } from '../types';
import { EmbedHtml } from './EmbedHtml';

function loadFacebookLib(callback: () => void) {
  const id = 'facebook-js';
  if (document.getElementById(id)) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.id = id;
  script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v12.0';
  script.async = true;
  script.onload = () => callback();
  document.head.appendChild(script);
}

export interface EmbedFacebookProps {
  meta: EmbedMeta;
  style?: CSSProperties;
}

export function EmbedFacebook({ meta, style }: EmbedFacebookProps) {
  const [ready, setReady] = useState(false);
  const postUrl = meta.original_url ?? meta.url ?? '';

  useEffect(() => {
    loadFacebookLib(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const fb = (window as Window & { FB?: { XFBML?: { parse: () => void } } }).FB;
    fb?.XFBML?.parse();
  }, [ready, postUrl]);

  if (meta.html) {
    return <EmbedHtml html={meta.html} className="m-embed-facebook" />;
  }

  if (!postUrl) return null;

  return (
    <div className="m-embed-facebook">
      <div className="fb-post" data-href={postUrl} data-width="500" style={style}>
        {!ready && (
          <a href={postUrl} target="_blank" rel="noopener noreferrer">
            View post on Facebook
          </a>
        )}
      </div>
    </div>
  );
}
