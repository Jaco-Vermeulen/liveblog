import { useCallback, useEffect, useState } from 'react';
import { AF } from '@/copy';
import { getAllBlogAnalytics, type BlogAnalyticsRow } from '@/mechanisms/liveblog-api';

export function useBlogAnalytics(blogId: string | undefined) {
  const [rows, setRows] = useState<BlogAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!blogId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBlogAnalytics(blogId);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.analytics.errors.load);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { rows, loading, error, refetch };
}
