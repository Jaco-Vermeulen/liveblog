import { useQuery } from '@tanstack/react-query';
import { blogHasWebhookQueryKey, listWebhooks } from '@/mechanisms/liveblog-api';
import { blogHasWebhook } from '../services/blogWebhooks';

export function useBlogHasWebhook(blogId: string) {
  const query = useQuery({
    queryKey: blogHasWebhookQueryKey(blogId),
    queryFn: async () => {
      const data = await listWebhooks();
      return blogHasWebhook(data._items, blogId);
    },
    enabled: Boolean(blogId),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return {
    hasWebhook: query.data ?? false,
    isLoading: query.isLoading,
  };
}
