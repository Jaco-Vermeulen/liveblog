import type { EmbedMeta } from '../types';

/** Sir Trevor card wrapper (legacy) — embed lives in `.embed-preview`. */
function extractFromSirTrevorCard(html: string): string | null {
  if (!html.includes('embed-preview') && !html.includes('liveblog--card')) {
    return null;
  }
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const preview = doc.querySelector('.embed-preview');
    const inner = preview?.innerHTML?.trim();
    return inner || null;
  } catch {
    return null;
  }
}

export function needsIframelyEmbedJs(html: string): boolean {
  return html.includes('iframely-embed') || html.includes('data-iframely-url');
}

/**
 * Best HTML to inject for preview/timeline (legacy + oEmbed).
 */
export function pickDisplayHtml(meta: EmbedMeta, text = ''): string {
  const metaHtml = typeof meta.html === 'string' ? meta.html.trim() : '';
  const textHtml = text.trim();

  const fromMetaCard = metaHtml ? extractFromSirTrevorCard(metaHtml) : null;
  if (fromMetaCard) return fromMetaCard;

  if (metaHtml && !metaHtml.includes('liveblog--card')) {
    return metaHtml;
  }

  const fromTextCard = textHtml ? extractFromSirTrevorCard(textHtml) : null;
  if (fromTextCard) return fromTextCard;

  if (metaHtml) return metaHtml;
  if (textHtml && textHtml.includes('<')) return textHtml;

  if (meta.thumbnail_url) {
    return `<img src="${meta.thumbnail_url}" alt="" style="max-width:100%;height:auto;" />`;
  }

  return '';
}
