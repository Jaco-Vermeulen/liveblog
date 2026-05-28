import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  enrichPosts,
  listBlogPosts,
  sortPostsClient,
  type Post,
  type TimelineSort,
} from '@/mechanisms/liveblog-api';
import type { EditorPanel, TimelineState } from '../types';

const MAX_RESULTS = 15;

function panelToStatus(panel: EditorPanel): string {
  switch (panel) {
    case 'drafts':
      return 'draft';
    case 'contributions':
      return 'submitted';
    case 'scheduled':
      return 'scheduled';
    case 'comments':
      return 'comment';
    default:
      return 'open';
  }
}

export function useTimeline(
  blogId: string,
  options: {
    panel?: EditorPanel;
    sort?: TimelineSort;
    sticky?: boolean;
    highlight?: boolean;
    noSyndication?: boolean;
  } = {},
) {
  const panel = options.panel ?? 'timeline';
  const sort = options.sort ?? 'editorial';
  /** Legacy main timeline uses `lb-sticky="false"`; pinned posts are a separate list (`lb-sticky="true"`). */
  const sticky = options.sticky;
  const highlight = options.highlight ?? false;
  const noSyndication = options.noSyndication ?? false;
  const status = panelToStatus(panel);

  const [pages, setPages] = useState<Post[][]>([]);
  const [meta, setMeta] = useState({ total: 0, max_results: MAX_RESULTS, page: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sortState, setSortState] = useState(sort);
  const [highlightState, setHighlightState] = useState(highlight);

  const flatPosts = useMemo(() => pages.flat(), [pages]);

  const loadPage = useCallback(
    async (pageIndex: number, replace = false) => {
      if (!blogId) return;
      setIsLoading(true);
      setError(null);
      try {
        const filters = {
          status,
          sticky: status === 'open' ? sticky : undefined,
          highlight: highlightState || undefined,
          noSyndication: noSyndication || undefined,
          scheduled: status === 'scheduled',
        };

        const result = await listBlogPosts(blogId, filters, MAX_RESULTS, pageIndex);
        const items = sortPostsClient(enrichPosts(result._items), sortState);

        setMeta({
          total: result._meta.total ?? 0,
          max_results: result._meta.max_results ?? MAX_RESULTS,
          page: result._meta.page ?? pageIndex,
        });

        setPages((prev) => {
          if (replace) {
            return items.length ? [items] : [];
          }
          const next = [...prev];
          next[pageIndex - 1] = items;
          return next.filter((p) => p.length > 0);
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [blogId, status, sticky, highlightState, noSyndication, sortState],
  );

  const fetchNewPage = useCallback(async () => {
    setPages([]);
    await loadPage(1, true);
  }, [loadPage]);

  const fetchNextPage = useCallback(async () => {
    const nextPage = pages.length + 1;
    const maxPage = Math.ceil(meta.total / (meta.max_results || MAX_RESULTS)) || 1;
    if (nextPage > maxPage || isLoading) return;
    await loadPage(nextPage, false);
  }, [pages.length, meta, isLoading, loadPage]);

  useEffect(() => {
    void fetchNewPage();
  }, [blogId, status, sticky, highlightState, noSyndication, sortState]);

  const addPost = useCallback((post: Post) => {
    setPages((prev) => {
      const all = sortPostsClient([...prev.flat(), post], sortState);
      const chunks: Post[][] = [];
      for (let i = 0; i < all.length; i += MAX_RESULTS) {
        chunks.push(all.slice(i, i + MAX_RESULTS));
      }
      return chunks;
    });
  }, [sortState]);

  const updatePost = useCallback((post: Post) => {
    setPages((prev) =>
      prev.map((page) =>
        page.map((p) => (p._id === post._id ? post : p)),
      ),
    );
  }, []);

  const removePost = useCallback((postId: string) => {
    setPages((prev) => prev.map((page) => page.filter((p) => p._id !== postId)).filter((p) => p.length > 0));
  }, []);

  const changeOrder = useCallback(async (newSort: TimelineSort) => {
    setSortState(newSort);
    setPages([]);
  }, []);

  const changeHighlight = useCallback(async (value: boolean) => {
    setHighlightState(value);
    setPages([]);
  }, []);

  const timeline: TimelineState = {
    blogId,
    panel,
    status,
    sort: sortState,
    sticky,
    highlight: highlightState,
    pages,
    meta,
    isLoading,
    error,
  };

  const hasMore =
    flatPosts.length < meta.total && meta.total > 0;

  return {
    timeline,
    posts: flatPosts,
    hasMore,
    fetchNewPage,
    fetchNextPage,
    addPost,
    updatePost,
    removePost,
    changeOrder,
    changeHighlight,
  };
}
