import { LbButton } from '@/components/ui/LbButton';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { AF } from '@/copy';
import type { Output } from '@/mechanisms/liveblog-api';

export interface OutputsTabProps {
  outputs: Output[];
  loading: boolean;
  onAdd(): void;
  onEdit(output: Output): void;
  onRemove(output: Output): void;
  onShowEmbed(output: Output): void;
}

export function OutputsTab({
  outputs,
  loading,
  onAdd,
  onEdit,
  onRemove,
  onShowEmbed,
}: OutputsTabProps) {
  if (loading) {
    return <LbSpinner tone="dark" />;
  }

  return (
    <div className="m-settings-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Uitsetkanale</h3>
        <LbButton type="button" variant="primary" onClick={onAdd}>
          + Nuwe uitset
        </LbButton>
      </div>
      <ul className="space-y-2">
        {outputs.length === 0 && (
          <li className="text-mar-muted text-sm">Geen uitsetkanale nie</li>
        )}
        {outputs.map((output) => (
          <li
            key={output._id}
            className="flex items-center justify-between rounded border border-mar-border bg-mar-input px-3 py-2"
          >
            <button
              type="button"
              className="font-medium text-mar-teal hover:underline"
              onClick={() => onEdit(output)}
            >
              {output.name}
            </button>
            <div className="flex gap-2">
              <LbButton type="button" variant="ghost" onClick={() => onShowEmbed(output)}>
                {AF.editor.output.embed}
              </LbButton>
              <LbButton type="button" variant="ghost" onClick={() => onEdit(output)}>
                Wysig
              </LbButton>
              <LbButton type="button" variant="ghost" onClick={() => onRemove(output)}>
                Verwyder
              </LbButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
