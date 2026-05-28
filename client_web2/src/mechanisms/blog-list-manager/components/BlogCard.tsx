import { LbBadge } from '@/components/ui/LbBadge';
import type { Blog } from '@/mechanisms/liveblog-api';
import { useBlogPermissions } from '../hooks/useBlogPermissions';
import type { BlogTabName } from '../types';

export interface BlogCardProps {
  blog: Blog;
  tab: BlogTabName;
  selected: boolean;
  onSelect(): void;
  onOpen(): void;
  onRequestAccess(): void;
}

function creatorLabel(blog: Blog): string {
  const creator = blog.original_creator;
  if (typeof creator === 'object') {
    return creator.display_name || creator.username || 'Onbekend';
  }
  return 'Onbekend';
}

export function BlogCard({
  blog,
  tab,
  selected,
  onSelect,
  onOpen,
  onRequestAccess,
}: BlogCardProps) {
  const permissions = useBlogPermissions(blog);
  const canOpen = permissions.canOpen;

  const handleClick = () => {
    if (canOpen) onOpen();
    else onRequestAccess();
  };

  return (
    <li className="relative m-blog-grid__item">
      {permissions.showCheckbox && (
        <label
          className="absolute left-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-mar-card/90 shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-4 w-4 accent-mar-teal"
            aria-label={`Kies ${blog.title}`}
          />
        </label>
      )}

      <article
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`m-blog-card ${canOpen ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'}`}
        title={canOpen ? undefined : 'Klik om toegang te versoek'}
      >
        {tab === 'deleted' && (
          <LbBadge className="absolute right-3 top-3 z-10" variant="orange">
            Verwyder
          </LbBadge>
        )}

        <div
          className="m-blog-card__media bg-cover bg-center"
          style={
            blog.picture_url
              ? { backgroundImage: `url(${blog.picture_url})` }
              : undefined
          }
        />

        <div className="m-blog-card__body">
          <h3 className="m-blog-card__title">{blog.title}</h3>
          {blog.description && (
            <p className="m-blog-card__dek">{blog.description.replace(/<[^>]+>/g, '')}</p>
          )}
          <dl className="m-blog-card__meta">
            <div className="flex gap-1">
              <dt>Berigte:</dt>
              <dd>{blog.total_posts ?? 0}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Skepper:</dt>
              <dd>{creatorLabel(blog)}</dd>
            </div>
          </dl>
        </div>
      </article>
    </li>
  );
}
