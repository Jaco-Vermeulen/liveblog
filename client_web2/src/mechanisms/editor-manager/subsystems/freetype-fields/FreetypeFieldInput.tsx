import { AF } from '@/copy';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import type { FreetypeField } from '@/mechanisms/freetypes-manager';

export interface FreetypeFieldInputProps {
  field: FreetypeField;
  value: string;
  onChange: (value: string) => void;
}

function fieldLabel(path: string): string {
  const leaf = path.split(/[.[\]]/).filter(Boolean).pop() ?? path;
  return leaf.replace(/_/g, ' ');
}

export function FreetypeFieldInput({ field, value, onChange }: FreetypeFieldInputProps) {
  const label = fieldLabel(field.path);
  const id = `freetype-${field.path.replace(/[^a-z0-9]+/gi, '-')}`;

  if (field.type === 'select' && field.options) {
    const options = field.options.split(',').map((o) => o.trim()).filter(Boolean);
    return (
      <LbFormField label={label} htmlFor={id}>
        <select
          id={id}
          className="m-editor-composer__select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Kies —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </LbFormField>
    );
  }

  const inputType =
    field.type === 'link' ? 'url' : field.type === 'image' ? 'url' : 'text';

  return (
    <LbFormField label={label} htmlFor={id}>
      {field.type === 'embed' ? (
        <textarea
          id={id}
          className="m-editor-composer__textarea"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={AF.editor.freetype.htmlPlaceholder}
        />
      ) : (
        <LbInput
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === 'image' ? 'Beeld-URL' : undefined}
        />
      )}
    </LbFormField>
  );
}
