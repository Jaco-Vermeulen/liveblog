import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import type { Blog } from '@/mechanisms/liveblog-api';
import { useBlogActions } from '../hooks/useBlogActions';
import { useBlogList } from '../hooks/useBlogList';
import { useBlogListWebSocket } from '../hooks/useBlogListWebSocket';
import { AccessRequestModal } from './AccessRequestModal';
import { BlogGrid } from './BlogGrid';
import { BlogListPagination } from './BlogListPagination';
import { BlogListToolbar } from './BlogListToolbar';
import { BulkActionBar } from './BulkActionBar';
import { CreateBlogModal } from './CreateBlogModal';
import { EmbedCodeModal } from './EmbedCodeModal';

export function BlogListPage() {
  const navigate = useNavigate();
  useBlogListWebSocket();

  const {
    tab,
    blogs,
    total,
    page,
    maxResults,
    searchQuery,
    setSearchQuery,
    setPage,
    selectedIds,
    toggleSelect,
    clearSelection,
    isLoading,
    error,
    refetch,
  } = useBlogList();

  const { bulkArchive, bulkActivate, softDelete, permanentDelete } = useBlogActions();
  const [createOpen, setCreateOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [accessBlog, setAccessBlog] = useState<Blog | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedBlogs = useMemo(
    () => blogs.filter((b) => selectedIds.has(b._id)),
    [blogs, selectedIds],
  );

  const openBlog = (blog: Blog) => {
    navigate(`/liveblog/edit/${blog._id}`);
  };

  const runBulk = async (fn: () => Promise<void>) => {
    if (selectedBlogs.length === 0) return;
    setBusy(true);
    setActionError(null);
    try {
      await fn();
      clearSelection();
      await refetch();
    } catch {
      setActionError('Aksie het misluk. Probeer weer.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <LbContentContainer centered={false} size="full" className="py-6">
      <BlogListToolbar
        searchQuery={searchQuery}
        total={total}
        onSearchChange={setSearchQuery}
        onCreateClick={() => setCreateOpen(true)}
        onEmbedClick={() => setEmbedOpen(true)}
      />

      {tab === 'deleted' && (
        <LbAlert variant="warning" className="mb-4">
          Blogs in hierdie oortjie word na &apos;n tydperk permanent verwyder.
        </LbAlert>
      )}

      {(error || actionError) && (
        <LbAlert variant="error" className="mb-4">
          {actionError ?? (error instanceof Error ? error.message : 'Kon nie blogs laai nie.')}
        </LbAlert>
      )}

      <BulkActionBar
        count={selectedIds.size}
        tab={tab}
        onCancel={clearSelection}
        onArchiveOrActivate={() =>
          runBulk(() =>
            tab === 'active' ? bulkArchive(selectedBlogs) : bulkActivate(selectedBlogs),
          )
        }
        onSoftDelete={() => runBulk(() => softDelete(selectedBlogs))}
        onPermanentDelete={() => runBulk(() => permanentDelete(selectedBlogs))}
      />

      <BlogGrid
        blogs={blogs}
        tab={tab}
        selectedIds={selectedIds}
        isLoading={isLoading || busy}
        onSelect={toggleSelect}
        onOpen={openBlog}
        onRequestAccess={setAccessBlog}
      />

      <BlogListPagination
        page={page}
        maxResults={maxResults}
        total={total}
        onPageChange={setPage}
      />

      <CreateBlogModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void refetch()}
      />

      <EmbedCodeModal open={embedOpen} onClose={() => setEmbedOpen(false)} />

      <AccessRequestModal
        blog={accessBlog}
        open={accessBlog != null}
        onClose={() => setAccessBlog(null)}
      />
    </LbContentContainer>
  );
}
