import { useCallback, useMemo, useState } from 'react';
import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { cn } from '@/lib/utils';

type TagsManagerProps = {
  tags: string[];
  onChange(tags: string[]): void;
  disabled?: boolean;
  label?: string;
  inputId?: string;
  placeholder?: string;
  hint?: string;
};

export function TagsManager({
  tags,
  onChange,
  disabled,
  label = 'Globale etikette',
  inputId = 'global-tags-input',
  placeholder = "Tik 'n etiket",
  hint = "Druk Enter of klik Voeg by. Om 'n bestaande etiket te wysig, verander nie etikette op bestaande plasings nie.",
}: TagsManagerProps) {
  const [draft, setDraft] = useState('');

  const addTag = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value || tags.includes(value)) {
        if (!value) setDraft('');
        return;
      }
      onChange([...tags, value]);
      setDraft('');
    },
    [tags, onChange],
  );

  const canAdd = Boolean(draft.trim()) && !disabled;

  const tagList = useMemo(
    () =>
      tags.map((tag) => (
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
              onClick={() => onChange(tags.filter((t) => t !== tag))}
            >
              ×
            </button>
          )}
        </span>
      )),
    [tags, onChange, disabled],
  );

  return (
    <LbFormField label={label} htmlFor={inputId}>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">{tagList}</div>
        <div className="flex flex-wrap gap-2">
          <LbInput
            id={inputId}
            value={draft}
            disabled={disabled}
            placeholder={placeholder}
            className="min-w-[12rem] flex-1"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(draft);
              }
            }}
          />
          <LbButton
            type="button"
            variant="secondary"
            disabled={!canAdd}
            onClick={() => addTag(draft)}
          >
            Voeg by
          </LbButton>
        </div>
        <p className={cn('m-0 text-xs text-mar-muted')}>{hint}</p>
      </div>
    </LbFormField>
  );
}
