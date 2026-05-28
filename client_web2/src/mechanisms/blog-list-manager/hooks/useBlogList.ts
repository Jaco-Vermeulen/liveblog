import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { listBlogs } from '@/mechanisms/liveblog-api';
import { BLOG_STATES, DEFAULT_PAGE_SIZE, tabFromPathname } from '../constants';
import type { BlogTabName } from '../types';

const SEARCH_DEBOUNCE_MS = 350;

export function useBlogListTab(): BlogTabName {
  const { pathname } = useLocation();
  return tabFromPathname(pathname);
}

export function useBlogList() {
  const tab = useBlogListTab();
  const blogState = BLOG_STATES[tab];
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [tab]);

  const queryKey = ['blogs', blogState.code, page, DEFAULT_PAGE_SIZE, searchQuery] as const;

  const query = useQuery({
    queryKey,
    queryFn: () =>
      listBlogs({
        blogStatus: blogState.code,
        page,
        maxResults: DEFAULT_PAGE_SIZE,
        searchQuery: searchQuery || undefined,
      }),
  });

  const blogs = useMemo(() => query.data?._items ?? [], [query.data?._items]);
  const total = query.data?._meta.total ?? 0;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(blogs.map((b) => b._id)));
  }, [blogs]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const queryClient = useQueryClient();
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['blogs'] });
  }, [queryClient]);

  return {
    tab,
    blogState,
    blogs,
    allBlogs: blogs,
    total,
    page,
    maxResults: DEFAULT_PAGE_SIZE,
    searchQuery: searchInput,
    setSearchQuery: setSearchInput,
    setPage,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch,
  };
}
