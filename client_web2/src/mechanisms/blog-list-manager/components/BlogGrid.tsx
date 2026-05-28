import { LbSpinner } from '@/components/ui/LbSpinner';
import type { Blog } from '@/mechanisms/liveblog-api';
import type { BlogTabName } from '../types';
import { BlogCard } from './BlogCard';

export interface BlogGridProps {
  blogs: Blog[];
  tab: BlogTabName;
  selectedIds: Set<string>;
  isLoading: boolean;
  onSelect(id: string): void;
  onOpen(blog: Blog): void;
  onRequestAccess(blog: Blog): void;
}

export function BlogGrid({
  blogs,
  tab,
  selectedIds,
  isLoading,
  onSelect,
  onOpen,
  onRequestAccess,
}: BlogGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LbSpinner tone="dark" />
        <span className="sr-only">Laai blogs…</span>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mar-border bg-mar-card/60 px-6 py-16 text-center text-mar-muted">
        Geen blogs gevind nie.
      </div>
    );
  }

  return (
    <ul className="m-blog-grid">
      {blogs.map((blog) => (
        <BlogCard
          key={blog._id}
          blog={blog}
          tab={tab}
          selected={selectedIds.has(blog._id)}
          onSelect={() => onSelect(blog._id)}
          onOpen={() => onOpen(blog)}
          onRequestAccess={() => onRequestAccess(blog)}
        />
      ))}
    </ul>
  );
}
