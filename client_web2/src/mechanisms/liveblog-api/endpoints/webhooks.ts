import { api } from '../client';
import type { EveList, Webhook } from '../types';

export function listWebhooks(): Promise<EveList<Webhook>> {
  return api.get<EveList<Webhook>>('/webhooks', { max_results: 200 });
}

export function saveWebhook(
  existing: Webhook | null,
  payload: Partial<Webhook>,
): Promise<Webhook> {
  if (existing?._id) {
    return api.patch<Webhook>(`/webhooks/${existing._id}`, payload, {
      etag: existing._etag,
    });
  }
  return api.post<Webhook>('/webhooks', payload);
}

export function removeWebhook(webhook: Webhook): Promise<void> {
  if (!webhook._id) {
    throw new Error('Webhook id required for delete');
  }
  return api.delete(`/webhooks/${webhook._id}`, { etag: webhook._etag });
}

export interface WebhookTestResult {
  queued: boolean;
  post_id: string;
  action: string;
  webhook_id: string;
}

export function testWebhook(webhook: Webhook): Promise<WebhookTestResult> {
  if (!webhook._id) {
    throw new Error('Webhook id required for test');
  }
  return api.post<WebhookTestResult>(`/webhooks/${webhook._id}/test`);
}
