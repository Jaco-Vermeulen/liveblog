import { useState } from 'react';
import { LbAlert, LbButton, LbFormField, LbInput, LbModal } from '@/components/ui';

type ChangePasswordModalProps = {
  open: boolean;
  onClose(): void;
  onSubmit(oldPassword: string, newPassword: string): Promise<void>;
};

export function ChangePasswordModal({ open, onClose, onSubmit }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && confirm !== newPassword;
  const canSave =
    oldPassword.length > 0 && newPassword.length > 0 && confirm === newPassword && !saving;

  const reset = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirm('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(oldPassword, newPassword);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon nie wagwoord verander nie');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LbModal
      open={open}
      onClose={handleClose}
      title="Verander wagwoord"
      footer={
        <>
          <LbButton type="button" variant="secondary" onClick={handleClose}>
            Kanselleer
          </LbButton>
          <LbButton type="button" variant="primary" disabled={!canSave} onClick={() => void handleSave()}>
            {saving ? 'Stoor…' : 'Stoor wagwoord'}
          </LbButton>
        </>
      }
    >
      {error && (
        <LbAlert variant="error" className="mb-4">
          {error}
        </LbAlert>
      )}
      <div className="grid gap-4">
        <LbFormField label="Huidige wagwoord" htmlFor="pwd-old">
          <LbInput
            id="pwd-old"
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </LbFormField>
        <LbFormField label="Nuwe wagwoord" htmlFor="pwd-new">
          <LbInput
            id="pwd-new"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </LbFormField>
        <LbFormField label="Bevestig nuwe wagwoord" htmlFor="pwd-confirm">
          <LbInput
            id="pwd-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch && (
            <p className="m-0 text-sm text-mar-orange">Wagwoorde stem nie ooreen nie.</p>
          )}
        </LbFormField>
      </div>
    </LbModal>
  );
}
