import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AF } from '@/copy';
import {
  invalidateWebhookQueries,
  listBlogs,
  listWebhooks,
  LiveblogApiError,
  removeWebhook,
  saveWebhook,
  testWebhook,
  type Blog,
  type Webhook,
  type WebhookAction,
  type WebhookDataFormat,
} from '@/mechanisms/liveblog-api';
import { normalizeWebhookUrl } from '../utils/normalizeWebhookUrl';

export interface WebhookFormState {
  name: string;
  destination_url: string;
  action: WebhookAction;
  blog_id: string;
  data_format: WebhookDataFormat;
  enabled: boolean;
}

export const WEBHOOK_ACTIONS: WebhookAction[] = [
  'post_created',
  'post_updated',
  'post_deleted',
];

export const WEBHOOK_DATA_FORMATS: WebhookDataFormat[] = ['news_card', 'raw'];

export const emptyWebhookForm = (): WebhookFormState => ({
  name: '',
  destination_url: '',
  action: 'post_created',
  blog_id: '',
  data_format: 'news_card',
  enabled: true,
});

export function useWebhooks() {
  const queryClient = useQueryClient();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modal, setModal] = useState<Webhook | null | 'new'>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hookData, blogData] = await Promise.all([
        listWebhooks(),
        listBlogs({ blogStatus: 'open', maxResults: 500 }),
      ]);
      setWebhooks(hookData._items);
      setBlogs(blogData._items);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.integrations.errors.load);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = async (form: WebhookFormState) => {
    setSaving(true);
    setError(null);
    try {
      const existing = modal && modal !== 'new' ? modal : null;
      await saveWebhook(existing, {
        name: form.name.trim(),
        destination_url: normalizeWebhookUrl(form.destination_url),
        action: form.action,
        blog_id: form.blog_id || null,
        data_format: form.data_format,
        enabled: form.enabled,
      });
      setModal(null);
      setMessage(AF.integrations.webhooks.saved);
      await refresh();
      await invalidateWebhookQueries(queryClient);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.integrations.errors.save);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (webhook: Webhook) => {
    setError(null);
    try {
      await removeWebhook(webhook);
      setMessage(AF.integrations.webhooks.removed);
      await refresh();
      await invalidateWebhookQueries(queryClient);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.integrations.errors.remove);
    }
  };

  const test = async (webhook: Webhook) => {
    if (!webhook._id) return;
    setTestingId(webhook._id);
    setError(null);
    setMessage(null);
    try {
      const result = await testWebhook(webhook);
      setMessage(AF.integrations.webhooks.testQueued(result.post_id));
    } catch (err) {
      if (err instanceof LiveblogApiError) {
        const body = err.body as { _error?: string | { message?: string }; _message?: string };
        const apiMessage =
          typeof body?._error === 'string'
            ? body._error
            : body?._error?.message ?? body?._message;
        setError(apiMessage ?? AF.integrations.errors.test);
      } else {
        setError(err instanceof Error ? err.message : AF.integrations.errors.test);
      }
    } finally {
      setTestingId(null);
    }
  };

  return {
    webhooks,
    blogs,
    loading,
    saving,
    error,
    message,
    modal,
    setModal,
    save,
    remove,
    test,
    testingId,
    setError,
    setMessage,
  };
}
