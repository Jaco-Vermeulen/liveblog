import { useMemo } from 'react';
import { LbFormField } from '@/components/ui/LbFormField';

export interface PostTagsSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  allowMultiple?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onChange(tags: string[]): void;
}

export function PostTagsSelector({
  availableTags,
  selectedTags,
  allowMultiple = true,
  disabled = false,
  isLoading = false,
  onChange,
}: PostTagsSelectorProps) {
  const remaining = useMemo(
    () => availableTags.filter((tag) => !selectedTags.includes(tag)),
    [availableTags, selectedTags],
  );

  const canAddMore = allowMultiple ? true : selectedTags.length === 0;

  const addTag = (tag: string) => {
    if (!tag || selectedTags.includes(tag)) return;
    if (!allowMultiple) {
      onChange([tag]);
      return;
    }
    onChange([...selectedTags, tag]);
  };

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  if (isLoading) {
    return (
      <LbFormField label="Etikette" htmlFor="post-tags-status">
        <p id="post-tags-status" className="m-0 text-sm text-mar-muted">
          Laai etikette…
        </p>
      </LbFormField>
    );
  }

  if (!availableTags.length) {
    return (
      <LbFormField label="Etikette" htmlFor="post-tags-status">
        <p id="post-tags-status" className="m-0 text-sm text-mar-muted">
          Geen globale etikette nie. Voeg etikette by onder Instellings → Algemeen.
        </p>
      </LbFormField>
    );
  }

  return (
    <LbFormField label="Etikette" htmlFor="post-tags-select">
      <div className="space-y-2">
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-mar-beige px-2 py-1 text-xs text-mar-text"
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    className="text-mar-muted hover:text-mar-orange"
                    aria-label={`Verwyder ${tag}`}
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="m-0 text-xs text-mar-muted">Geen etikette gekies nie.</p>
        )}

        {canAddMore && remaining.length > 0 && !disabled ? (
          <select
            id="post-tags-select"
            className="w-full max-w-md rounded-lg border border-mar-border bg-white px-3 py-2 text-sm text-mar-text"
            value=""
            onChange={(e) => {
              const tag = e.target.value;
              if (tag) addTag(tag);
              e.currentTarget.value = '';
            }}
          >
            <option value="">Kies etiket…</option>
            {remaining.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        ) : null}

        {!allowMultiple && selectedTags.length > 0 ? (
          <p className="m-0 text-xs text-mar-muted">Slegs een etiket per plasing toegelaat.</p>
        ) : null}
      </div>
    </LbFormField>
  );
}
