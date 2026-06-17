import type { QueryClient } from '@tanstack/react-query';

export const WEBHOOKS_QUERY_KEY = ['webhooks'] as const;

export const blogHasWebhookQueryKey = (blogId: string) =>
  [...WEBHOOKS_QUERY_KEY, 'blog', blogId] as const;

export function invalidateWebhookQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: WEBHOOKS_QUERY_KEY });
}
