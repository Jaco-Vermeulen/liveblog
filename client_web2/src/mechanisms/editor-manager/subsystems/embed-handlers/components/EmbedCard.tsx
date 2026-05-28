import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EmbedMeta } from '../types';
import { getEmbedEditorConfig } from '../services/embedEditorConfig';
import {
  buildDefaultCredit,
  mergeEmbedCardEdits,
  normalizeProviderName,
} from '../services/mergeEmbedMeta';
import { PostItemEmbed } from './PostItemEmbed';

const SOCIAL_HIDE_LINK = new Set(['Facebook', 'Youtube', 'Twitter', 'Soundcloud']);

export interface EmbedCardProps {
  meta: EmbedMeta;
  onMetaChange: (meta: EmbedMeta) => void;
}

export function EmbedCard({ meta, onMetaChange }: EmbedCardProps) {
  const { coverMaxWidth } = getEmbedEditorConfig();
  const provider = normalizeProviderName(meta.provider_name);
  const isTwitter = provider === 'Twitter';
  const isInstagram = provider === 'Instagram';
  const hideLink = SOCIAL_HIDE_LINK.has(provider);

  const [title, setTitle] = useState(meta.title ?? '');
  const [description, setDescription] = useState(meta.description ?? '');
  const [credit, setCredit] = useState(meta.credit ?? buildDefaultCredit(meta));
  const [showEmbedDescription, setShowEmbedDescription] = useState(
    Boolean(meta.show_embed_description),
  );
  const [coverHidden, setCoverHidden] = useState(false);
  const savedCoverUrl = useRef(meta.thumbnail_url);

  useEffect(() => {
    setTitle(meta.title ?? '');
    setDescription(meta.description ?? '');
    setCredit(meta.credit ?? buildDefaultCredit(meta));
    setShowEmbedDescription(Boolean(meta.show_embed_description));
    savedCoverUrl.current = meta.thumbnail_url;
    setCoverHidden(false);
  }, [meta.original_url, meta.url, meta.html]);

  const pushEdits = useCallback(
    (edits: Parameters<typeof mergeEmbedCardEdits>[1]) => {
      onMetaChange(mergeEmbedCardEdits(meta, edits));
    },
    [meta, onMetaChange],
  );

  const coverStyle = useMemo(() => {
    const url = coverHidden ? savedCoverUrl.current : meta.thumbnail_url;
    if (!url || meta.html) return null;
    const width = meta.thumbnail_width ?? coverMaxWidth;
    const height = meta.thumbnail_height ?? width * 0.56;
    const coverWidth = Math.min(coverMaxWidth, width);
    const coverHeight = (coverWidth / width) * height;
    return {
      backgroundImage: `url("${url}")`,
      width: coverWidth,
      height: coverHeight,
    };
  }, [coverHidden, coverMaxWidth, meta.html, meta.thumbnail_height, meta.thumbnail_url, meta.thumbnail_width]);

  const embedUrl = String(meta.original_url ?? meta.url ?? '').trim();

  return (
    <div className="m-embed-card liveblog--card">
      <div className="m-embed-card__media">
        <PostItemEmbed
          item={{ item_type: 'embed', text: meta.html ?? embedUrl, meta }}
          showInfo={false}
        />
      </div>

      {coverStyle && !coverHidden && (
        <div className="m-embed-card__cover-wrap">
          <div className="m-embed-card__cover" style={coverStyle} role="img" aria-hidden />
          <button
            type="button"
            className="m-embed-card__cover-toggle"
            onClick={() => {
              setCoverHidden(true);
              pushEdits({ coverHidden: true });
            }}
          >
            Versteek illustrasie
          </button>
        </div>
      )}

      {coverStyle && coverHidden && (
        <button
          type="button"
          className="m-embed-card__cover-toggle"
          onClick={() => {
            setCoverHidden(false);
            pushEdits({ coverHidden: false });
          }}
        >
          Wys illustrasie
        </button>
      )}

      {!isTwitter && !isInstagram && (
        <>
          <label className="m-embed-card__field">
            <span className="m-embed-card__field-label">Titel</span>
            <textarea
              className="m-embed-card__field-input m-embed-card__field-input--title"
              rows={2}
              value={title}
              placeholder="title"
              onChange={(e) => {
                setTitle(e.target.value);
                pushEdits({ title: e.target.value });
              }}
            />
          </label>
          <label className="m-embed-card__field">
            <span className="m-embed-card__field-label">Beskrywing</span>
            <textarea
              className="m-embed-card__field-input"
              rows={3}
              value={description}
              placeholder="description"
              onChange={(e) => {
                setDescription(e.target.value);
                pushEdits({ description: e.target.value });
              }}
            />
          </label>
        </>
      )}

      {!isTwitter && (
        <label className="m-embed-card__field">
          <span className="m-embed-card__field-label">Krediet</span>
          <textarea
            className="m-embed-card__field-input m-embed-card__field-input--credit"
            rows={2}
            value={credit}
            placeholder="credit"
            onChange={(e) => {
              setCredit(e.target.value);
              pushEdits({ credit: e.target.value });
            }}
          />
        </label>
      )}

      {isInstagram && (
        <label className="m-embed-card__check">
          <input
            type="checkbox"
            checked={showEmbedDescription}
            onChange={(e) => {
              setShowEmbedDescription(e.target.checked);
              pushEdits({ showEmbedDescription: e.target.checked });
            }}
          />
          Wys Instagram-beskrywing
        </label>
      )}

      {!hideLink && embedUrl && (
        <a
          className="m-embed-card__link"
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {embedUrl}
        </a>
      )}
    </div>
  );
}
