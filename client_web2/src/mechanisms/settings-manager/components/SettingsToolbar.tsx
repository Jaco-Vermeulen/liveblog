import { useNavigate } from 'react-router-dom';
import { LbButton } from '@/components/ui/LbButton';

type SettingsToolbarProps = {
  onSave(): void;
  saving?: boolean;
  saveDisabled?: boolean;
};

export function SettingsToolbar({ onSave, saving, saveDisabled }: SettingsToolbarProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-wrap justify-end gap-2">
      <LbButton type="button" variant="secondary" onClick={() => navigate('/liveblog')}>
        Kanselleer
      </LbButton>
      <LbButton
        type="button"
        variant="primary"
        disabled={saveDisabled || saving}
        onClick={onSave}
      >
        {saving ? 'Stoor…' : 'Stoor'}
      </LbButton>
    </div>
  );
}
