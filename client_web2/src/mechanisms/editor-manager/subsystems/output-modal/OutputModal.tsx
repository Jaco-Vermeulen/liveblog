import { useEffect, useState, type FormEvent } from 'react';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import type { Blog, Collection, Output, Theme } from '@/mechanisms/liveblog-api';
import { listCollections, listSelectableThemes } from '@/mechanisms/liveblog-api';

export interface OutputModalProps {
  open: boolean;
  blog: Blog;
  output: Output | null;
  onClose(): void;
  onSave(data: Partial<Output>, existing?: Output | null): Promise<void>;
}

export function OutputModal({ open, blog, output, onClose, onSave }: OutputModalProps) {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [collection, setCollection] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(output?.name ?? '');
    setTheme(output?.theme ?? blog.blog_preferences?.theme?.toString() ?? '');
    setCollection(output?.collection ?? '');
    setLoading(true);
    Promise.all([listSelectableThemes(), listCollections()])
      .then(([themeList, collectionList]) => {
        setThemes(themeList);
        setCollections(collectionList._items);
        if (!collection && collectionList._items[0]) {
          setCollection(collectionList._items[0]._id);
        }
      })
      .finally(() => setLoading(false));
  }, [open, output, blog, collection]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !collection) return;
    setSaving(true);
    try {
      await onSave(
        {
          name: name.trim(),
          theme: theme || null,
          collection,
          blog: blog._id,
          settings: output?.settings ?? { frequency: 10, order: -1 },
          style: output?.style ?? {},
          tags: output?.tags ?? [],
        },
        output,
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <LbModal
      open={open}
      onClose={onClose}
      title={output?._id ? 'Wysig uitsetkanaal' : 'Nuwe uitsetkanaal'}
      className="max-w-lg"
    >
      {loading ? (
        <LbSpinner tone="dark" />
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <LbFormField label="Naam" htmlFor="output-name">
            <LbInput
              id="output-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </LbFormField>
          <LbFormField label="Tema" htmlFor="output-theme">
            <select
              id="output-theme"
              className="w-full rounded border border-mar-border bg-mar-input px-3 py-2"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="">—</option>
              {themes.map((t) => (
                <option key={t._id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </LbFormField>
          <LbFormField label="Versameling" htmlFor="output-collection">
            <select
              id="output-collection"
              className="w-full rounded border border-mar-border bg-mar-input px-3 py-2"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              required
            >
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </LbFormField>
          <div className="flex justify-end gap-2">
            <LbButton type="button" variant="secondary" onClick={onClose}>
              Kanselleer
            </LbButton>
            <LbButton type="submit" variant="primary" disabled={saving}>
              {saving ? 'Stoor…' : 'Stoor'}
            </LbButton>
          </div>
        </form>
      )}
    </LbModal>
  );
}
