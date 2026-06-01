import { LbButton } from '@/components/ui/LbButton';
import { LbSpinner } from '@/components/ui/LbSpinner';
import type { Post } from '@/mechanisms/liveblog-api';
import type { TimelineState } from '../types';
import { AF } from '@/copy';
import { PostCard } from './PostCard';
import { ThemedPostCard } from './ThemedPostCard';

export interface TimelineProps {
  timeline: TimelineState;
  posts: Post[];
  hasMore: boolean;
  allowPinHighlight?: boolean;
  variant?: 'default' | 'preview';
  onPostSelect: (post: Post) => void;
  onLoadMore: () => void;
  onDeletePost?: (post: Post) => void;
  onPublishPost?: (post: Post) => void;
  onUnpublishPost?: (post: Post) => void;
  onTogglePin?: (post: Post) => void;
  onToggleHighlight?: (post: Post) => void;
}

export function Timeline({
  timeline,
  posts,
  hasMore,
  variant = 'default',
  onPostSelect,
  onLoadMore,
  allowPinHighlight = true,
  onDeletePost,
  onPublishPost,
  onUnpublishPost,
  onTogglePin,
  onToggleHighlight,
}: TimelineProps) {
  if (timeline.error) {
    return (
      <div className="m-editor-timeline m-editor-timeline--error" role="alert">
        {timeline.error.message}
      </div>
    );
  }

  const sectionClass =
    variant === 'preview'
      ? 'm-editor-timeline m-editor-timeline--in-preview'
      : 'm-editor-timeline';

  return (
    <section className={sectionClass} aria-label={AF.editor.timelineSection}>
      {timeline.isLoading && posts.length === 0 ? (
        <div className="m-editor-timeline__loading">
          <LbSpinner />
          <span>{AF.editor.loadingPosts}</span>
        </div>
      ) : null}

      {!timeline.isLoading && posts.length === 0 ? (
        <p className="m-editor-timeline__empty">{AF.editor.noPosts}</p>
      ) : null}

      <ul className="m-editor-timeline__list">
        {posts.map((post) => (
          <li key={post._id}>
            {variant === 'preview' ? (
              <ThemedPostCard
                post={post}
                allowPinHighlight={allowPinHighlight}
                onEdit={() => onPostSelect(post)}
                onDelete={onDeletePost ? () => onDeletePost(post) : undefined}
                onPublish={onPublishPost ? () => onPublishPost(post) : undefined}
                onUnpublish={onUnpublishPost ? () => onUnpublishPost(post) : undefined}
                onTogglePin={onTogglePin ? () => onTogglePin(post) : undefined}
                onToggleHighlight={
                  onToggleHighlight ? () => onToggleHighlight(post) : undefined
                }
              />
            ) : (
              <PostCard
                post={post}
                allowPinHighlight={allowPinHighlight}
                onEdit={() => onPostSelect(post)}
                onDelete={onDeletePost ? () => onDeletePost(post) : undefined}
                onPublish={onPublishPost ? () => onPublishPost(post) : undefined}
                onUnpublish={onUnpublishPost ? () => onUnpublishPost(post) : undefined}
                onTogglePin={onTogglePin ? () => onTogglePin(post) : undefined}
                onToggleHighlight={
                  onToggleHighlight ? () => onToggleHighlight(post) : undefined
                }
              />
            )}
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="m-editor-timeline__more">
          <LbButton
            type="button"
            variant="secondary"
            onClick={onLoadMore}
            disabled={timeline.isLoading}
          >
            {timeline.isLoading ? AF.common.loading : AF.editor.loadMore}
          </LbButton>
        </div>
      )}
    </section>
  );
}
