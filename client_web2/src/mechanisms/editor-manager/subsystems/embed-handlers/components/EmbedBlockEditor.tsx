import { AF } from '@/copy';
import { useCallback, useEffect, useRef, useState } from 'react';

const E = AF.editor.embed;
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbSpinner } from '@/components/ui/LbSpinner';
import type { EmbedMeta } from '../types';
import { useEmbedResolve } from '../hooks/useEmbedResolve';
import { detectEmbedProvider } from '../detectProvider';
import { canPreviewEmbed, embedTargetUrl } from '../services/canPreviewEmbed';
import {
  autoResolveDelayMs,
  normalizeEmbedInput,
  shouldAutoResolveInput,
} from '../services/normalizeEmbedInput';
import { EmbedCard } from './EmbedCard';

export interface EmbedBlockEditorProps {
  url: string;
  embedMeta?: EmbedMeta | null;
  onChange: (data: { url: string; embedMeta?: EmbedMeta | null }) => void;
}

export function EmbedBlockEditor({ url, embedMeta, onChange }: EmbedBlockEditorProps) {
  const { meta, isResolving, error, resolve, setMeta } = useEmbedResolve(embedMeta ?? null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResolvedUrl = useRef<string | null>(null);
  const [urlInputVisible, setUrlInputVisible] = useState(
    !embedMeta?.html && !embedMeta?.provider_name,
  );

  const displayMeta = meta ?? embedMeta ?? null;
  const provider = detectEmbedProvider(url);
  const showCard = !isResolving && canPreviewEmbed(displayMeta, url);

  useEffect(() => {
    if (!embedMeta || !canPreviewEmbed(embedMeta, url)) return;
    setMeta(embedMeta);
    const target = embedTargetUrl(embedMeta, url);
    if (target) lastResolvedUrl.current = target;
    setUrlInputVisible(false);
  }, [embedMeta, setMeta, url]);

  const runResolve = useCallback(
    async (raw: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      const trimmed = normalizeEmbedInput(raw);
      if (!trimmed) {
        lastResolvedUrl.current = null;
        setMeta(null);
        onChange({ url: '', embedMeta: null });
        setUrlInputVisible(true);
        return;
      }

      if (!shouldAutoResolveInput(raw)) {
        return;
      }

      const current = meta ?? embedMeta;
      const currentTarget = current ? embedTargetUrl(current, trimmed) : '';
      if (
        trimmed === lastResolvedUrl.current &&
        current &&
        canPreviewEmbed(current, trimmed) &&
        currentTarget === lastResolvedUrl.current
      ) {
        return;
      }

      const resolved = await resolve(trimmed);
      if (resolved) {
        const target = embedTargetUrl(resolved, trimmed);
        lastResolvedUrl.current = target || trimmed;
        onChange({
          url: target || trimmed,
          embedMeta: resolved,
        });
        setUrlInputVisible(false);
      }
    },
    [embedMeta, meta, onChange, resolve, setMeta],
  );

  const scheduleResolve = useCallback(
    (value: string, immediate = false) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      if (immediate) {
        void runResolve(value);
        return;
      }

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void runResolve(value);
      }, autoResolveDelayMs(value));
    },
    [runResolve],
  );

  const handleUrlChange = useCallback(
    (next: string) => {
      const normalized = normalizeEmbedInput(next);
      const stillResolved =
        Boolean(lastResolvedUrl.current) &&
        normalized === lastResolvedUrl.current;

      onChange({
        url: next,
        embedMeta: stillResolved ? embedMeta : null,
      });

      if (!next.trim()) {
        lastResolvedUrl.current = null;
        setMeta(null);
        return;
      }

      scheduleResolve(next);
    },
    [embedMeta, onChange, scheduleResolve, setMeta],
  );

  const handleMetaChange = useCallback(
    (next: EmbedMeta) => {
      setMeta(next);
      onChange({
        url: embedTargetUrl(next, url) || url,
        embedMeta: next,
      });
    },
    [onChange, setMeta, url],
  );

  return (
    <div className="m-embed-block-editor">
      {urlInputVisible ? (
        <>
          <LbFormField label={E.urlOrCodeLabel} htmlFor="embed-url-input">
            <input
              id="embed-url-input"
              type="text"
              className="m-editor-composer__input"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (!pasted.trim()) return;
                e.preventDefault();
                handleUrlChange(pasted);
                scheduleResolve(pasted, true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  scheduleResolve(url, true);
                }
              }}
              placeholder={E.urlPlaceholder}
            />
          </LbFormField>
          <p className="m-embed-block-editor__hint">{E.urlHint}</p>
        </>
      ) : (
        <div className="m-embed-block-editor__url-bar">
          <span className="m-embed-preview__badge">{provider.label}</span>
          <LbButton
            type="button"
            variant="ghost"
            onClick={() => setUrlInputVisible(true)}
          >
            {E.changeUrl}
          </LbButton>
        </div>
      )}

      {isResolving && (
        <div className="m-embed-block-editor__loading">
          <LbSpinner />
          <span>{E.loading}</span>
        </div>
      )}

      {error && (
        <LbAlert variant="error" className="mt-2 text-sm">
          {error}
        </LbAlert>
      )}

      {showCard && displayMeta && (
        <EmbedCard meta={displayMeta} onMetaChange={handleMetaChange} />
      )}

      {!isResolving && displayMeta && !showCard && !error && (
        <LbAlert variant="warning" className="mt-2 text-sm">
          Kon nie &apos;n voorbeskou bou nie. Gaan die URL na of probeer weer.
        </LbAlert>
      )}
    </div>
  );
}
