import type { EmbedMeta } from '../types';

export interface EmbedCardEdits {
  title?: string;
  description?: string;
  credit?: string;
  showEmbedDescription?: boolean;
  coverHidden?: boolean;
}

export function normalizeProviderName(name?: string): string {
  if (!name) return '';
  if (name.toLowerCase() === 'facebookapp') return 'Facebook';
  return name;
}

export function buildDefaultCredit(meta: EmbedMeta): string {
  if (meta.credit?.trim()) return meta.credit.trim();
  const parts: string[] = [];
  if (meta.provider_name) parts.push(meta.provider_name);
  if (meta.author_name) {
    const author = meta.author_url
      ? `${meta.author_name} (${meta.author_url})`
      : meta.author_name;
    parts.push(author);
  }
  return parts.join(' | ');
}

/** Strip empty strings (legacy `retrieveData` cleanup). */
export function cleanEmbedMeta(meta: EmbedMeta): EmbedMeta {
  const next: EmbedMeta = { ...meta };
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (typeof value === 'string' && value.trim() === '') {
      delete next[key];
    }
  }
  return next;
}

export function fixEmbedHtml(meta: EmbedMeta): EmbedMeta {
  if (!meta.html || typeof document === 'undefined') return meta;
  const tmp = document.createElement('div');
  tmp.innerHTML = meta.html;
  return { ...meta, html: tmp.innerHTML };
}

export function mergeEmbedCardEdits(base: EmbedMeta, edits: EmbedCardEdits): EmbedMeta {
  const next: EmbedMeta = {
    ...base,
    liveblog_version: base.liveblog_version ?? '3.4',
  };

  if (edits.title !== undefined) {
    next.title = edits.title.trim() || undefined;
  }
  if (edits.description !== undefined) {
    next.description = edits.description.trim() || undefined;
  }
  if (edits.credit !== undefined) {
    next.credit = edits.credit.trim() || undefined;
  }
  if (edits.showEmbedDescription !== undefined) {
    next.show_embed_description = edits.showEmbedDescription;
  }
  if (edits.coverHidden) {
    next.thumbnail_url = undefined;
  }

  return cleanEmbedMeta(next);
}

export function metaForSave(meta: EmbedMeta, edits: EmbedCardEdits = {}): EmbedMeta {
  return cleanEmbedMeta(mergeEmbedCardEdits(fixEmbedHtml(meta), edits));
}
