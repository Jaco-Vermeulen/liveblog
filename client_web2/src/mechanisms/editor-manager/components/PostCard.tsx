import { EyeOff, Pencil, Pin, Send, Star, Trash2 } from 'lucide-react';
import type { Post, PostItem } from '@/mechanisms/liveblog-api';
import { EmbedHtml, PostItemEmbed } from '../subsystems/embed-handlers';
import { isRichTextHtml } from '../subsystems/rich-text-editor';

export interface PostCardProps {
  post: Post;
  /** `live` = public blog styling inside preview frame; `editor` = admin timeline card */
  variant?: 'editor' | 'live';
  allowEditing?: boolean;
  allowDeleting?: boolean;
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

export function PostCard({
  post,
  variant = 'editor',
  allowEditing = true,
  allowDeleting = true,
  allowPinHighlight = true,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onTogglePin,
  onToggleHighlight,
}: PostCardProps) {
  const isLive = variant === 'live';
  const mainItem = post.mainItem?.item;

  function renderBody(item: PostItem | undefined) {
    if (!item) return '(Geen inhoud)';
    if (item.group_type === 'freetype' && item.text) {
      return <EmbedHtml html={item.text} className="m-editor-post-card__freetype" />;
    }
    if (item.item_type === 'embed') {
      return <PostItemEmbed item={item} showInfo={false} />;
    }
    if (item.item_type === 'image' && item.text) {
      return <EmbedHtml html={item.text} className="m-editor-post-card__image" />;
    }
    const text =
      item.text ??
      (item.meta?.url != null ? String(item.meta.url) : '') ??
      '';
    if (!text) return '(Geen inhoud)';
    if (isRichTextHtml(text)) {
      return <EmbedHtml html={text} className="m-editor-post-card__rich-text" />;
    }
    return text;
  }

  const statusLabel =
    post.post_status === 'draft'
      ? 'Konsep'
      : post.post_status === 'submitted'
        ? 'Bydrae'
        : post.post_status === 'scheduled'
          ? 'Geskeduleer'
          : null;

  const author = authorLabel(post);
  const time = formatPostTime(post);

  const showActions =
    (allowEditing && onEdit) ||
    (post.post_status !== 'open' && onPublish) ||
    (allowDeleting && onDelete) ||
    (allowPinHighlight && onTogglePin) ||
    (allowPinHighlight && onToggleHighlight);

  const articleClass = isLive
    ? [
        'lb-post',
        'lb-post--preview',
        post.sticky ? 'lb-post--sticky' : '',
        post.lb_highlight ? 'lb-post--highlight' : '',
        post.post_status !== 'open' ? 'lb-post--unpublished' : '',
      ]
        .filter(Boolean)
        .join(' ')
    : 'm-editor-post-card';

  const actionsToolbar = showActions ? (
    <div
      className={isLive ? 'lb-post__actions' : 'm-editor-post-card__actions'}
      role="toolbar"
      aria-label="Plasing-aksies"
    >
            {allowPinHighlight && onTogglePin && (
              <button
                type="button"
                className={`${isLive ? 'lb-post__action' : 'm-editor-post-card__action'}${post.sticky ? ` ${isLive ? 'lb-post__action--active' : 'm-editor-post-card__action--active'}` : ''}`}
                onClick={onTogglePin}
                title={post.sticky ? 'Ontspeld' : 'Speld vas'}
                aria-label={post.sticky ? 'Ontspeld' : 'Speld vas'}
                aria-pressed={post.sticky}
              >
                <Pin aria-hidden />
              </button>
            )}
            {allowPinHighlight && onToggleHighlight && (
              <button
                type="button"
                className={`${isLive ? 'lb-post__action' : 'm-editor-post-card__action'}${post.lb_highlight ? ` ${isLive ? 'lb-post__action--active' : 'm-editor-post-card__action--active'}` : ''}`}
                onClick={onToggleHighlight}
                title={post.lb_highlight ? 'Verwyder beklemtoning' : 'Beklemtoon'}
                aria-label={post.lb_highlight ? 'Verwyder beklemtoning' : 'Beklemtoon'}
                aria-pressed={post.lb_highlight}
              >
                <Star aria-hidden />
              </button>
            )}
            {allowEditing && onEdit && (
              <button
                type="button"
                className={isLive ? 'lb-post__action' : 'm-editor-post-card__action'}
                onClick={onEdit}
                title="Wysig"
                aria-label="Wysig"
              >
                <Pencil aria-hidden />
              </button>
            )}
            {post.post_status !== 'open' && onPublish && (
              <button
                type="button"
                className={isLive ? 'lb-post__action' : 'm-editor-post-card__action'}
                onClick={onPublish}
                title="Publiseer"
                aria-label="Publiseer"
              >
                <Send aria-hidden />
              </button>
            )}
            {post.post_status === 'open' && onUnpublish && (
              <button
                type="button"
                className={isLive ? 'lb-post__action' : 'm-editor-post-card__action'}
                onClick={onUnpublish}
                title="Ontpubliseer"
                aria-label="Ontpubliseer"
              >
                <EyeOff aria-hidden />
              </button>
            )}
            {allowDeleting && onDelete && (
              <button
                type="button"
                className={
                  isLive
                    ? 'lb-post__action lb-post__action--danger'
                    : 'm-editor-post-card__action m-editor-post-card__action--danger'
                }
                onClick={onDelete}
                title="Verwyder"
                aria-label="Verwyder"
              >
                <Trash2 aria-hidden />
              </button>
            )}
    </div>
  ) : null;

  if (isLive) {
    return (
      <article className={articleClass} data-post-id={post._id}>
        {actionsToolbar}
        <header className="lb-post__header">
          <div className="lb-post__meta">
            {author ? <span className="lb-post__author">{author}</span> : null}
            {time ? (
              <time className="lb-post__time" dateTime={time}>
                {time}
              </time>
            ) : null}
            {statusLabel ? <span className="lb-post__status">{statusLabel}</span> : null}
          </div>
        </header>
        <div className="lb-post__content">{renderBody(mainItem)}</div>
      </article>
    );
  }

  return (
    <article className={articleClass} data-post-id={post._id}>
      <header className="m-editor-post-card__header">
        <div className="m-editor-post-card__meta">
          {statusLabel ? (
            <span className="m-editor-post-card__status">{statusLabel}</span>
          ) : (
            <span className="m-editor-post-card__status">Gepubliseer</span>
          )}
          {author && <span className="m-editor-post-card__author">{author}</span>}
          {time && (
            <time className="m-editor-post-card__time" dateTime={time}>
              {time}
            </time>
          )}
          {post.sticky && <span className="m-editor-post-card__badge">Sticky</span>}
          {post.lb_highlight && <span className="m-editor-post-card__badge">Highlight</span>}
        </div>
        {actionsToolbar}
      </header>
      <div className="m-editor-post-card__body">{renderBody(mainItem)}</div>
    </article>
  );
}
