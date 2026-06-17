import type { Webhook } from '@/mechanisms/liveblog-api';

export function webhookAppliesToBlog(webhook: Webhook, blogId: string): boolean {
  if (!webhook.enabled) return false;
  const hookBlogId = webhook.blog_id?.trim();
  if (!hookBlogId) return true;
  return hookBlogId === blogId;
}

export function blogHasWebhook(webhooks: Webhook[], blogId: string): boolean {
  if (!blogId) return false;
  return webhooks.some((webhook) => webhookAppliesToBlog(webhook, blogId));
}
