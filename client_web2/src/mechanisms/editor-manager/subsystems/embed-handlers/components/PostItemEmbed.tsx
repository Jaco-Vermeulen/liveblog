import type { PostItem } from '@/mechanisms/liveblog-api';
import type { EmbedMeta } from '../types';
import { pickDisplayHtml } from '../services/pickDisplayHtml';
import { EmbedFacebook } from './EmbedFacebook';
import { EmbedHtml } from './EmbedHtml';
import { EmbedInfo } from './EmbedInfo';
import { EmbedInstagram } from './EmbedInstagram';
import { EmbedTwitter } from './EmbedTwitter';

function metaFromItem(item: PostItem): EmbedMeta {
  const meta = (item.meta ?? {}) as EmbedMeta;
  const text = item.text?.trim() ?? '';
  const urlFromText =
    text && /^https?:\/\//i.test(text) ? text : undefined;
  return {
    ...meta,
    original_url: meta.original_url ?? meta.url ?? urlFromText,
    url: meta.url ?? urlFromText ?? meta.original_url,
  };
}

function normalizeProvider(name?: string): string {
  if (!name) return '';
  if (name.toLowerCase() === 'facebookapp') return 'Facebook';
  return name;
}

function isTwitterMarkup(meta: EmbedMeta, text: string): boolean {
  if (normalizeProvider(meta.provider_name) === 'Twitter') return true;
  const blob = `${meta.html ?? ''}${text}`;
  return blob.includes('twitter-tweet') || blob.includes('twitter.com/');
}

function isInstagramMarkup(meta: EmbedMeta): boolean {
  return normalizeProvider(meta.provider_name) === 'Instagram';
}

function isFacebookMarkup(meta: EmbedMeta): boolean {
  const p = normalizeProvider(meta.provider_name);
  return p === 'Facebook';
}

export interface PostItemEmbedProps {
  item: PostItem;
  showInfo?: boolean;
}

/**
 * Timeline / composer — mirrors legacy `itemEmbedRender.tsx` (client-side React, not SSR).
 */
export function PostItemEmbed({ item, showInfo = true }: PostItemEmbedProps) {
  const meta = metaFromItem(item);
  const text = item.text ?? '';
  const provider = normalizeProvider(meta.provider_name);
  const embedUrl = String(meta.original_url ?? meta.url ?? '').trim();

  if (isTwitterMarkup(meta, text)) {
    return (
      <div className="m-post-item-embed">
        <EmbedTwitter url={embedUrl} linkText={meta.title} />
        {showInfo && <EmbedInfo meta={meta} credit="Twitter" />}
      </div>
    );
  }

  if (isInstagramMarkup(meta)) {
    return (
      <div className="m-post-item-embed">
        <EmbedInstagram meta={meta} />
        {showInfo && <EmbedInfo meta={meta} />}
      </div>
    );
  }

  if (isFacebookMarkup(meta)) {
    return (
      <div className="m-post-item-embed">
        {meta.html ? (
          <EmbedHtml html={meta.html} className="m-embed-html" />
        ) : (
          <EmbedFacebook meta={meta} />
        )}
        {showInfo && <EmbedInfo meta={meta} originalUrl={embedUrl || undefined} />}
      </div>
    );
  }

  const displayHtml = pickDisplayHtml(meta, text);

  return (
    <div className="m-post-item-embed">
      {displayHtml ? (
        <EmbedHtml html={displayHtml} className="m-embed-html" />
      ) : embedUrl ? (
        <a
          className="m-embed-info__link"
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {embedUrl}
        </a>
      ) : null}
      {showInfo && displayHtml && provider && provider !== 'Embed' && (
        <EmbedInfo meta={meta} credit={provider} />
      )}
    </div>
  );
}
