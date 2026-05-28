import { useMemo } from 'react';
import type { LiveblogUser } from '@/mechanisms/liveblog-api';
import { composerToPreviewItems, previewAuthorLabel } from '../services/composerPreview';
import type { ComposerState } from '../types';
import { PreviewPostItem } from './PreviewPostItem';

export interface ComposerDraftPreviewProps {
  composer: ComposerState;
  user: LiveblogUser | null;
}

/** Unpublished draft at the top of the live preview column. */
export function ComposerDraftPreview({ composer, user }: ComposerDraftPreviewProps) {
  const items = useMemo(() => composerToPreviewItems(composer), [composer]);

  if (!composer.isDirty && items.length === 0) {
    return null;
  }

  const author = previewAuthorLabel(user);
  const previewTime = new Date().toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <article className="lb-post list-group-item lb-post--draft" aria-label="Konsep-voorskou">
      <span className="lb-post__draft-label">Konsep — nog nie gepubliseer</span>
      <header className="lb-post-header">
        <div className="lb-post-date-icons">
          <div className="lb-post-date relativeDate">{previewTime}</div>
        </div>
        <div className="lb-author">
          <span className="lb-author__name">{author}</span>
        </div>
      </header>
      {items.length === 0 ? (
        <p className="lb-preview-empty">Tik inhoud om die konsep-voorskou te sien.</p>
      ) : (
        <div className="items-container">
          {items.map((item, index) => (
            <PreviewPostItem key={`draft-${item.item_type}-${index}`} item={item} />
          ))}
        </div>
      )}
    </article>
  );
}
