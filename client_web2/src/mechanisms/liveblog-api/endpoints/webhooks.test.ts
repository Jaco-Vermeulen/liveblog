import { describe, expect, it, vi, beforeEach } from 'vitest';
import { listWebhooks, saveWebhook, removeWebhook, testWebhook } from './webhooks';

vi.mock('../client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../client';

describe('webhooks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listWebhooks fetches webhooks collection', async () => {
    vi.mocked(api.get).mockResolvedValue({ _items: [], _meta: { total: 0 } });
    await listWebhooks();
    expect(api.get).toHaveBeenCalledWith('/webhooks', { max_results: 200 });
  });

  it('saveWebhook posts new webhook', async () => {
    vi.mocked(api.post).mockResolvedValue({ _id: '1', name: 'Hook' });
    await saveWebhook(null, { name: 'Hook', destination_url: 'http://localhost/hook/' });
    expect(api.post).toHaveBeenCalledWith('/webhooks', {
      name: 'Hook',
      destination_url: 'http://localhost/hook/',
    });
  });

  it('saveWebhook patches existing webhook', async () => {
    vi.mocked(api.patch).mockResolvedValue({ _id: '1', name: 'Updated' });
    await saveWebhook(
      { _id: '1', _etag: 'etag', name: 'Old' } as never,
      { name: 'Updated' },
    );
    expect(api.patch).toHaveBeenCalledWith(
      '/webhooks/1',
      { name: 'Updated' },
      { etag: 'etag' },
    );
  });

  it('removeWebhook deletes by id', async () => {
    await removeWebhook({ _id: '1', _etag: 'etag' } as never);
    expect(api.delete).toHaveBeenCalledWith('/webhooks/1', { etag: 'etag' });
  });

  it('testWebhook posts to test endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({
      queued: true,
      post_id: 'post-1',
      action: 'created',
      webhook_id: '1',
    });
    await testWebhook({ _id: '1', name: 'Hook' } as never);
    expect(api.post).toHaveBeenCalledWith('/webhooks/1/test');
  });
});
