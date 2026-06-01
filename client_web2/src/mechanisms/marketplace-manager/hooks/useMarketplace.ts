import { useCallback, useEffect, useState } from 'react';
import { AF } from '@/copy';
import { useSearchParams } from 'react-router-dom';
import {
  listMarketplaceBlogs,
  listMarketplaceLanguages,
  listMarketplaceMarketers,
  type MarketplaceBlog,
  type MarketplaceFilters,
  type MarketplaceLanguage,
  type MarketplaceMarketer,
} from '@/mechanisms/liveblog-api';
import { splitBlogsByStartDate } from '../utils/splitBlogsByDate';

export type MarketplaceTab = 'Marketers' | 'Producers';

export function useMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('Marketers');
  const [blogs, setBlogs] = useState<MarketplaceBlog[]>([]);
  const [forthcoming, setForthcoming] = useState<MarketplaceBlog[]>([]);
  const [marketers, setMarketers] = useState<MarketplaceMarketer[]>([]);
  const [languages, setLanguages] = useState<MarketplaceLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchPanelOpen, setSearchPanelOpen] = useState(true);
  const [embedModalBlog, setEmbedModalBlog] = useState<MarketplaceBlog | null>(null);

  const filters: MarketplaceFilters = (() => {
    const raw = searchParams.get('filters');
    if (!raw) return {};
    try {
      return JSON.parse(raw) as MarketplaceFilters;
    } catch {
      return {};
    }
  })();

  const setFilters = useCallback(
    (next: MarketplaceFilters) => {
      setSearchParams({ filters: JSON.stringify(next) });
    },
    [setSearchParams],
  );

  const loadBlogs = useCallback(
    async (f: MarketplaceFilters) => {
      const data = await listMarketplaceBlogs(f);
      const split = splitBlogsByStartDate(data._items);
      setBlogs(split.active);
      setForthcoming(split.forthcoming);
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [marketerData, languageData] = await Promise.all([
        listMarketplaceMarketers(),
        listMarketplaceLanguages(),
      ]);
      setMarketers(marketerData._items);
      setLanguages(languageData._items);
      await loadBlogs(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.marketplace.errors.load);
    } finally {
      setLoading(false);
    }
  }, [filters, loadBlogs]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleFilter = (type: string, value: unknown) => {
    const next = { ...filters };
    if (next[type] === value) {
      delete next[type];
    } else {
      next[type] = value;
    }
    setFilters(next);
  };

  return {
    activeTab,
    setActiveTab,
    blogs,
    forthcoming,
    marketers,
    languages,
    filters,
    loading,
    error,
    searchPanelOpen,
    setSearchPanelOpen,
    embedModalBlog,
    setEmbedModalBlog,
    toggleFilter,
    setFilters,
  };
}
