import type { EmbedMeta } from '../types';
import { pickDisplayHtml } from './pickDisplayHtml';

export function embedTargetUrl(meta: EmbedMeta, url = ''): string {
  return String(meta.original_url ?? meta.url ?? url).trim();
}

/** True when composer/timeline can render a resolved embed preview. */
export function canPreviewEmbed(meta: EmbedMeta | null, url = ''): boolean {
  if (!meta) return false;

  const target = embedTargetUrl(meta, url);
  const provider = (meta.provider_name ?? '').toLowerCase();

  if (pickDisplayHtml(meta, url)) return true;

  if (
    target &&
    (provider === 'twitter' ||
      provider === 'instagram' ||
      provider === 'facebook' ||
      provider === 'facebookapp')
  ) {
    return true;
  }

  return Boolean(meta.html?.trim() || meta.thumbnail_url);
}
