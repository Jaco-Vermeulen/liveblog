import { useState } from 'react';
import { AF } from '@/copy';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import {
  emptyWebhookForm,
  useWebhooks,
  WEBHOOK_ACTIONS,
  WEBHOOK_DATA_FORMATS,
  type WebhookFormState,
} from '../hooks/useWebhooks';
import type { Webhook } from '@/mechanisms/liveblog-api';

function webhookActionLabel(action: Webhook['action']): string {
  return AF.integrations.webhooks.actions[action];
}

function webhookFormatLabel(format: Webhook['data_format']): string {
  return AF.integrations.webhooks.dataFormats[format];
}

export function IntegrationsPage() {
  const mgr = useWebhooks();
  const [form, setForm] = useState<WebhookFormState>(emptyWebhookForm());

  const openModal = (webhook?: Webhook) => {
    mgr.setModal(webhook ?? 'new');
    setForm(
      webhook
        ? {
            name: webhook.name,
            destination_url: webhook.destination_url,
            action: webhook.action,
            blog_id: webhook.blog_id ?? '',
            data_format: webhook.data_format,
            enabled: webhook.enabled,
          }
        : emptyWebhookForm(),
    );
  };

  const blogTitle = (blogId?: string | null) => {
    if (!blogId) return AF.integrations.webhooks.allBlogs;
    return mgr.blogs.find((b) => b._id === blogId)?.title ?? blogId;
  };

  return (
    <LbContentContainer size="lg" className="py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-mar-ink">{AF.integrations.title}</h1>
        <p className="mt-1 text-sm text-mar-muted">{AF.integrations.subtitle}</p>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-mar-ink">
              {AF.integrations.webhooks.heading}
            </h2>
            <p className="text-sm text-mar-muted">{AF.integrations.webhooks.description}</p>
          </div>
          <LbButton type="button" variant="primary" onClick={() => openModal()}>
            {AF.integrations.webhooks.add}
          </LbButton>
        </div>

        {mgr.error && (
          <LbAlert variant="error" className="mb-4">
            {mgr.error}
          </LbAlert>
        )}
        {mgr.message && (
          <LbAlert variant="info" className="mb-4" role="status">
            {mgr.message}
          </LbAlert>
        )}

        {mgr.loading ? (
          <LbSpinner tone="dark" />
        ) : mgr.webhooks.length === 0 ? (
          <p className="rounded border border-mar-border bg-mar-panel p-6 text-sm text-mar-muted">
            {AF.integrations.webhooks.empty}
          </p>
        ) : (
          <ul className="divide-y divide-mar-border rounded border border-mar-border bg-mar-panel">
            {mgr.webhooks.map((hook) => (
              <li key={hook._id} className="flex flex-col gap-2 p-4 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-mar-ink">{hook.name}</span>
                    {!hook.enabled && (
                      <span className="rounded bg-mar-beige px-2 py-0.5 text-xs text-mar-muted">
                        {AF.integrations.webhooks.disabled}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 break-all text-sm text-mar-muted">{hook.destination_url}</p>
                  <p className="mt-1 text-xs text-mar-muted">
                    {webhookActionLabel(hook.action)} · {blogTitle(hook.blog_id)} ·{' '}
                    {webhookFormatLabel(hook.data_format)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <LbButton
                    type="button"
                    variant="secondary"
                    disabled={mgr.testingId === hook._id}
                    onClick={() => void mgr.test(hook)}
                  >
                    {mgr.testingId === hook._id
                      ? AF.integrations.webhooks.testing
                      : AF.integrations.webhooks.test}
                  </LbButton>
                  <LbButton type="button" variant="secondary" onClick={() => openModal(hook)}>
                    {AF.common.edit}
                  </LbButton>
                  <LbButton
                    type="button"
                    variant="secondary"
                    onClick={() => void mgr.remove(hook)}
                  >
                    {AF.common.remove}
                  </LbButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <LbModal
        open={mgr.modal !== null}
        onClose={() => mgr.setModal(null)}
        title={
          mgr.modal && mgr.modal !== 'new'
            ? AF.integrations.webhooks.editTitle
            : AF.integrations.webhooks.addTitle
        }
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void mgr.save(form);
          }}
        >
          <LbFormField label={AF.integrations.webhooks.fields.name} required>
            <LbInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </LbFormField>

          <LbFormField label={AF.integrations.webhooks.fields.destination} required>
            <LbInput
              type="text"
              inputMode="url"
              autoComplete="url"
              value={form.destination_url}
              onChange={(e) => setForm((f) => ({ ...f, destination_url: e.target.value }))}
              placeholder="192.168.1.10:3000/api/webhooks/liveblog/nuus/"
              required
            />
            <p className="mt-1 text-xs text-mar-muted">
              {AF.integrations.webhooks.fields.destinationHint}
            </p>
          </LbFormField>

          <LbFormField label={AF.integrations.webhooks.fields.action} required>
            <select
              className="w-full rounded border border-mar-border bg-white px-3 py-2 text-sm"
              value={form.action}
              onChange={(e) =>
                setForm((f) => ({ ...f, action: e.target.value as WebhookFormState['action'] }))
              }
            >
              {WEBHOOK_ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {webhookActionLabel(action)}
                </option>
              ))}
            </select>
          </LbFormField>

          <LbFormField label={AF.integrations.webhooks.fields.blog}>
            <select
              className="w-full rounded border border-mar-border bg-white px-3 py-2 text-sm"
              value={form.blog_id}
              onChange={(e) => setForm((f) => ({ ...f, blog_id: e.target.value }))}
            >
              <option value="">{AF.integrations.webhooks.allBlogs}</option>
              {mgr.blogs.map((blog) => (
                <option key={blog._id} value={blog._id}>
                  {blog.title}
                </option>
              ))}
            </select>
          </LbFormField>

          <LbFormField label={AF.integrations.webhooks.fields.dataFormat} required>
            <select
              className="w-full rounded border border-mar-border bg-white px-3 py-2 text-sm"
              value={form.data_format}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  data_format: e.target.value as WebhookFormState['data_format'],
                }))
              }
            >
              {WEBHOOK_DATA_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {webhookFormatLabel(format)}
                </option>
              ))}
            </select>
            {form.data_format === 'news_card' && (
              <p className="mt-1 text-xs text-mar-muted">
                {AF.integrations.webhooks.newsCardHint}
              </p>
            )}
          </LbFormField>

          <label className="flex items-center gap-2 text-sm text-mar-ink">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            />
            {AF.integrations.webhooks.fields.enabled}
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <LbButton type="button" variant="secondary" onClick={() => mgr.setModal(null)}>
              {AF.common.cancel}
            </LbButton>
            <LbButton type="submit" variant="primary" disabled={mgr.saving}>
              {mgr.saving ? AF.common.saving : AF.common.save}
            </LbButton>
          </div>
        </form>
      </LbModal>
    </LbContentContainer>
  );
}
