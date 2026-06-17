import { EyeOff, Pencil, Pin, Send, Star, Trash2 } from 'lucide-react';
import type { Post, PostItem } from '@/mechanisms/liveblog-api';
import { PostItemEmbed, EmbedHtml } from '../subsystems/embed-handlers';
import { isRichTextHtml } from '../subsystems/rich-text-editor';
import { resolvePostBadge } from '../services/postItemsType';
import { PostTypeBadge } from './PostTypeBadge';

export interface ThemedPostCardProps {
  post: Post;
  allowPinHighlight?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onTogglePin?: () => void;
  onToggleHighlight?: () => void;
}

function formatPostTime(post: Post): string | null {
  const raw = post.post_status === 'open' ? post.published_date : post._created;
  if (!raw) return null;
  try {
    return new Date(raw).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return raw;
  }
}

function authorLabel(post: Post): string | null {
  const item = post.mainItem?.item;
  const user = item?.user;
  if (user && typeof user === 'object') {
    return user.display_name || user.username || null;
  }
  return null;
}

function renderItemBody(item: PostItem | undefined) {
  if (!item) return <p>(Geen inhoud)</p>;
  if (item.group_type === 'freetype' && item.text) {
    return <EmbedHtml html={item.text} className="m-embed-html" />;
  }
  if (item.item_type === 'embed') {
    return <PostItemEmbed item={item} showInfo={false} />;
  }
  if (item.item_type === 'image' && item.text) {
    return <EmbedHtml html={item.text} className="m-embed-html" />;
  }
  const text = item.text?.trim() ?? '';
  if (!text) return <p>(Geen inhoud)</p>;
  if (isRichTextHtml(text)) {
    return <EmbedHtml html={text} className="m-embed-html lb-post__rich-text" />;
  }
  return <p>{text}</p>;
}

export function ThemedPostCard({
  post,
  allowPinHighlight = true,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onTogglePin,
  onToggleHighlight,
}: ThemedPostCardProps) {
  const mainItem = post.mainItem?.item;
  const { postItemsType, postItemsIcon } = resolvePostBadge(post);
  const type = postItemsType ?? mainItem?.item_type ?? 'text';
  const author = authorLabel(post);
  const time = formatPostTime(post);

  const articleClass = [
    'lb-post',
    'list-group-item',
    'show-author-avatar',
    type,
    post.lb_highlight ? 'lb-post--highlighted' : '',
    post.sticky ? 'lb-post--sticky' : '',
    'lb-post--admin-preview',
  ]
    .filter(Boolean)
    .join(' ');

  const showActions =
    onEdit || onDelete || onPublish || onUnpublish || onTogglePin || onToggleHighlight;

  return (
    <article className={articleClass} data-post-id={post._id} data-post-sticky={post.sticky}>
      {showActions ? (
        <div className="lb-post-admin-actions" role="toolbar" aria-label="Plasing-aksies">
          {allowPinHighlight && onTogglePin ? (
            <button
              type="button"
              className={`lb-post-admin-actions__btn${post.sticky ? ' lb-post-admin-actions__btn--active' : ''}`}
              onClick={onTogglePin}
              title={post.sticky ? 'Ontspeld' : 'Speld vas'}
              aria-label={post.sticky ? 'Ontspeld' : 'Speld vas'}
            >
              <Pin aria-hidden />
            </button>
          ) : null}
          {allowPinHighlight && onToggleHighlight ? (
            <button
              type="button"
              className={`lb-post-admin-actions__btn${post.lb_highlight ? ' lb-post-admin-actions__btn--active' : ''}`}
              onClick={onToggleHighlight}
              title={post.lb_highlight ? 'Verwyder beklemtoning' : 'Beklemtoon'}
              aria-label={post.lb_highlight ? 'Verwyder beklemtoning' : 'Beklemtoon'}
            >
              <Star aria-hidden />
            </button>
          ) : null}
          {onEdit ? (
            <button type="button" className="lb-post-admin-actions__btn" onClick={onEdit} title="Wysig" aria-label="Wysig">
              <Pencil aria-hidden />
            </button>
          ) : null}
          {post.post_status !== 'open' && onPublish ? (
            <button type="button" className="lb-post-admin-actions__btn" onClick={onPublish} title="Publiseer" aria-label="Publiseer">
              <Send aria-hidden />
            </button>
          ) : null}
          {post.post_status === 'open' && onUnpublish ? (
            <button type="button" className="lb-post-admin-actions__btn" onClick={onUnpublish} title="Ontpubliseer" aria-label="Ontpubliseer">
              <EyeOff aria-hidden />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className="lb-post-admin-actions__btn lb-post-admin-actions__btn--danger"
              onClick={onDelete}
              title="Verwyder"
              aria-label="Verwyder"
            >
              <Trash2 aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="lb-post-header">
        <PostTypeBadge postItemsType={postItemsType} postItemsIcon={postItemsIcon} />
        <div className="lb-post-date-icons">
          {post.sticky ? <span className="lb-post-pin-indicator" aria-hidden /> : null}
          {post.lb_highlight ? <span className="lb-post-highlight-indicator" aria-hidden /> : null}
          {time ? (
            <div className="lb-post-date relativeDate" data-js-timestamp={time}>
              {time}
            </div>
          ) : null}
        </div>
        {author ? (
          <div className="lb-author">
            <span className="lb-author__name">{author}</span>
          </div>
        ) : null}
      </div>

      <div className="items-container">{renderItemBody(mainItem)}</div>
    </article>
  );
}
