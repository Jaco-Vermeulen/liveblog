import { LbButton } from '@/components/ui/LbButton';
import type { BlogTabName } from '../types';

export interface BulkActionBarProps {
  count: number;
  tab: BlogTabName;
  onCancel(): void;
  onArchiveOrActivate(): void;
  onSoftDelete(): void;
  onPermanentDelete(): void;
}

export function BulkActionBar({
  count,
  tab,
  onCancel,
  onArchiveOrActivate,
  onSoftDelete,
  onPermanentDelete,
}: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-mar-teal/30 bg-mar-teal/10 px-4 py-3">
      <span className="text-sm font-medium text-mar-text">{count} gekies</span>
      <LbButton type="button" variant="ghost" onClick={onCancel}>
        Kanselleer
      </LbButton>
      {tab !== 'deleted' && (
        <>
          <LbButton type="button" variant="secondary" onClick={onArchiveOrActivate}>
            {tab === 'active' ? 'Geargiveer' : 'Aktiveer'}
          </LbButton>
          <LbButton type="button" variant="secondary" onClick={onSoftDelete}>
            Verwyder
          </LbButton>
        </>
      )}
      {tab === 'deleted' && (
        <LbButton type="button" variant="secondary" onClick={onPermanentDelete}>
          Verwyder permanent
        </LbButton>
      )}
    </div>
  );
}
