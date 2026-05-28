import { useState } from 'react';
import { LbButton } from '@/components/ui/LbButton';
import { LbSpinner } from '@/components/ui/LbSpinner';
import type { Blog, Consumer } from '@/mechanisms/liveblog-api';
import { getConsumerTags } from '../../hooks/useBlogSettings';

export interface ConsumersListProps {
  blog: Blog;
  consumers: Consumer[];
  loading: boolean;
  onSaveConsumerSettings(settings: Blog['consumers_settings']): Promise<void>;
  isSaving: boolean;
}

export function ConsumersList({
  blog,
  consumers,
  loading,
  onSaveConsumerSettings,
  isSaving,
}: ConsumersListProps) {
  const [selected, setSelected] = useState<Consumer | null>(null);
  const [tagsText, setTagsText] = useState('');

  const selectConsumer = (consumer: Consumer) => {
    setSelected(consumer);
    const tags = getConsumerTags(blog, consumer);
    setTagsText(tags.join(', '));
  };

  const handleSave = async () => {
    if (!selected) return;
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const next = { ...(blog.consumers_settings ?? {}) };
    next[selected._id] = { tags: tags.length ? tags : null };
    await onSaveConsumerSettings(next);
  };

  if (loading) {
    return <LbSpinner tone="dark" />;
  }

  return (
    <div className="m-settings-panel m-settings-consumers">
      <h3 className="mb-4 text-lg font-semibold">Verbruikers</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <ul className="space-y-1 rounded border border-mar-border p-2">
          {consumers.map((consumer) => (
            <li key={consumer._id}>
              <button
                type="button"
                className={`w-full rounded px-2 py-2 text-left hover:bg-mar-beige ${
                  selected?._id === consumer._id ? 'bg-mar-beige font-medium' : ''
                }`}
                onClick={() => selectConsumer(consumer)}
              >
                {consumer.name}
              </button>
            </li>
          ))}
        </ul>
        {selected && (
          <div className="rounded border border-mar-border bg-mar-input p-4">
            <h4 className="font-medium">{selected.name}</h4>
            <p className="mt-1 text-sm text-mar-muted break-all">{selected.webhook_url}</p>
            <label className="mt-4 block text-sm font-medium" htmlFor="consumer-tags">
              Tags (komma-geskei)
            </label>
            <input
              id="consumer-tags"
              className="mt-1 w-full rounded border border-mar-border px-3 py-2"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="sport, nuus"
            />
            <LbButton
              type="button"
              variant="primary"
              className="mt-3"
              disabled={isSaving}
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Stoor…' : 'Stoor tags'}
            </LbButton>
          </div>
        )}
      </div>
    </div>
  );
}
