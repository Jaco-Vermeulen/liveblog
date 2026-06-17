import { useMemo } from 'react';
import type { LiveblogUser } from '@/mechanisms/liveblog-api';
import { AF } from '@/copy';
import { composerToPreviewItems, previewAuthorLabel } from '../services/composerPreview';
import { previewLbItemClass } from '../services/previewItemLayout';
import { calculatePostItemsType } from '../services/postItemsType';
import type { ComposerState } from '../types';
import { PostTypeBadge } from './PostTypeBadge';
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
  const { postItemsType, postItemsIcon } = calculatePostItemsType({}, items);
  const previewTime = new Date().toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const articleClass = [
    'lb-post',
    'list-group-item',
    'show-author-avatar',
    postItemsType ?? '',
    composer.sticky ? 'lb-post--sticky' : '',
    composer.highlight ? 'lb-post--highlighted' : '',
    'lb-post--draft',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={articleClass} aria-label={AF.editor.draftPreview}>
      <span className="lb-post__draft-label">{AF.editor.draftLabel}</span>
      <div className="lb-post-header">
        <PostTypeBadge postItemsType={postItemsType} postItemsIcon={postItemsIcon} />
        <div className="lb-post-date-icons">
          {composer.sticky ? <span className="lb-post-pin-indicator" aria-hidden /> : null}
          {composer.highlight ? <span className="lb-post-highlight-indicator" aria-hidden /> : null}
          <div className="lb-post-date relativeDate">{previewTime}</div>
        </div>
        <div className="lb-author">
          <span className="lb-author__name">{author}</span>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="lb-preview-empty">{AF.editor.draftEmpty}</p>
      ) : (
        <div className="items-container">
          {items.map((item, index) => (
            <div key={`draft-${item.item_type}-${index}`} className={previewLbItemClass(item)}>
              <PreviewPostItem item={item} />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
