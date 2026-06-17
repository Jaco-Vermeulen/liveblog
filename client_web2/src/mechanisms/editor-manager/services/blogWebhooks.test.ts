import { describe, expect, it } from 'vitest';
import type { Webhook } from '@/mechanisms/liveblog-api';
import { blogHasWebhook, webhookAppliesToBlog } from './blogWebhooks';

const hook = (overrides: Partial<Webhook> = {}): Webhook =>
  ({
    _id: 'hook-1',
    name: 'Test',
    destination_url: 'https://example.com/hook',
    action: 'post_created',
    data_format: 'news_card',
    enabled: true,
    blog_id: 'blog-1',
    ...overrides,
  }) as Webhook;

describe('blogWebhooks', () => {
  it('webhookAppliesToBlog matches specific blog when enabled', () => {
    expect(webhookAppliesToBlog(hook({ blog_id: 'blog-1' }), 'blog-1')).toBe(true);
    expect(webhookAppliesToBlog(hook({ blog_id: 'blog-1' }), 'blog-2')).toBe(false);
  });

  it('webhookAppliesToBlog matches all blogs when blog_id is empty', () => {
    expect(webhookAppliesToBlog(hook({ blog_id: null }), 'blog-1')).toBe(true);
    expect(webhookAppliesToBlog(hook({ blog_id: '' }), 'blog-2')).toBe(true);
  });

  it('webhookAppliesToBlog ignores disabled webhooks', () => {
    expect(webhookAppliesToBlog(hook({ enabled: false }), 'blog-1')).toBe(false);
  });

  it('blogHasWebhook returns true when any webhook applies', () => {
    expect(blogHasWebhook([hook({ blog_id: 'blog-2' }), hook({ blog_id: 'blog-1' })], 'blog-1')).toBe(
      true,
    );
    expect(blogHasWebhook([hook({ blog_id: 'blog-2' })], 'blog-1')).toBe(false);
    expect(blogHasWebhook([], 'blog-1')).toBe(false);
  });
});
