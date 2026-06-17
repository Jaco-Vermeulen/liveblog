import type { PostItem } from '@/mechanisms/liveblog-api';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/** Theme `lb-item` class for a preview post item (matches server templates). */
export function previewLbItemClass(item: PostItem): string {
  if (item.group_type === 'freetype') {
    return `lb-item ${item.item_type ?? 'Scorecard'}`;
  }

  const type = item.item_type?.toLowerCase() ?? 'text';
  if (type === 'image') return 'lb-item image';
  if (item.meta && typeof item.meta === 'object' && 'quote' in item.meta) {
    return 'lb-item quote';
  }
  return `lb-item ${type}`;
}

/** Build image markup when the composer only has a URL (not saved HTML yet). */
export function imagePreviewHtml(item: PostItem): string | null {
  const text = item.text?.trim() ?? '';
  if (text.includes('<')) return text;

  const meta = item.meta && typeof item.meta === 'object' ? item.meta : {};
  const media =
    'media' in meta && meta.media && typeof meta.media === 'object'
      ? (meta.media as {
          renditions?: Record<string, { href?: string }>;
        })
      : undefined;
  const renditions = media?.renditions;
  const url =
    renditions?.viewImage?.href ??
    renditions?.baseImage?.href ??
    renditions?.thumbnail?.href ??
    text;
  if (!url) return null;

  const caption = typeof meta.caption === 'string' ? meta.caption.trim() : '';
  const alt = escapeAttr(caption);
  const src = escapeAttr(url);
  return `<figure><img src="${src}" alt="${alt}" /></figure>`;
}
