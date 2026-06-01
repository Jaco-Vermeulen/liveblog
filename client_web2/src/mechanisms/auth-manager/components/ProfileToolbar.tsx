import { LbButton } from '@/components/ui/LbButton';
import { AF } from '@/copy';

type ProfileToolbarProps = {
  onSave(): void;
  saving?: boolean;
  saveDisabled?: boolean;
};

export function ProfileToolbar({ onSave, saving, saveDisabled }: ProfileToolbarProps) {
  return (
    <div className="mb-6 flex flex-wrap justify-end gap-2">
      <LbButton
        type="button"
        variant="primary"
        disabled={saveDisabled || saving}
        onClick={onSave}
      >
        {saving ? AF.common.saving : AF.common.save}
      </LbButton>
    </div>
  );
}
