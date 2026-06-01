import { Link2, Plus, Search } from 'lucide-react';
import { LbButton } from '@/components/ui/LbButton';
import { LbInput } from '@/components/ui/LbInput';
import { AF } from '@/copy';
import { useCanCreateBlog } from '../hooks/useBlogPermissions';

export interface BlogListToolbarProps {
  searchQuery: string;
  total: number;
  onSearchChange(value: string): void;
  onCreateClick(): void;
  onEmbedClick(): void;
}

export function BlogListToolbar({
  searchQuery,
  total,
  onSearchChange,
  onCreateClick,
  onEmbedClick,
}: BlogListToolbarProps) {
  const canCreate = useCanCreateBlog();

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-mar-text">{AF.blogs.title}</h1>
        <p className="text-sm text-mar-muted">{AF.blogs.count(total)}</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mar-meta"
            aria-hidden
          />
          <LbInput
            type="search"
            placeholder={AF.blogs.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label={AF.blogs.searchAria}
          />
        </div>

        <div className="flex shrink-0 gap-2">
          <LbButton type="button" variant="secondary" onClick={onEmbedClick} title={AF.blogs.embedList}>
            <Link2 className="h-4 w-4" aria-hidden />
            <span className="sr-only">{AF.blogs.embedShort}</span>
          </LbButton>

          {canCreate && (
            <LbButton type="button" variant="accent" onClick={onCreateClick}>
              <Plus className="h-4 w-4" aria-hidden />
              {AF.blogs.createBlog}
            </LbButton>
          )}
        </div>
      </div>
    </header>
  );
}
