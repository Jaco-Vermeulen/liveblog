import { LbFormField } from '@/components/ui/LbFormField';
import { cn } from '@/lib/utils';

type JsonEditorProps = {
  value: string;
  onChange(value: string): void;
  error?: string | null;
  readOnly?: boolean;
  id?: string;
};

const editorClass =
  'min-h-[320px] w-full resize-y rounded border border-mar-border bg-mar-input px-3 py-2 font-mono text-sm text-mar-text focus:border-mar-teal focus:outline-none focus:ring-1 focus:ring-mar-teal';

export function JsonEditor({
  value,
  onChange,
  error,
  readOnly,
  id = 'instance-settings-json',
}: JsonEditorProps) {
  return (
    <LbFormField label="Instansie JSON" htmlFor={id}>
      <textarea
        id={id}
        className={cn(editorClass, error && 'border-red-500')}
        value={value}
        readOnly={readOnly}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="m-0 text-sm text-red-600">{error}</p>}
    </LbFormField>
  );
}
