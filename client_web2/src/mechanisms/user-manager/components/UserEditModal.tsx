import { LbButton } from '@/components/ui/LbButton';
import { LbFormField } from '@/components/ui/LbFormField';
import { LbInput } from '@/components/ui/LbInput';
import { LbModal } from '@/components/ui/LbModal';
import type { LiveblogRole, LiveblogUser } from '@/mechanisms/liveblog-api';
import type { UserFormState } from '../utils/userForm';

const inputClass =
  'w-full rounded border border-mar-border bg-mar-input px-3 py-2 text-sm text-mar-text';

type UserEditModalProps = {
  open: boolean;
  editing: LiveblogUser | null;
  form: UserFormState;
  roles: LiveblogRole[];
  saving: boolean;
  onClose: () => void;
  onChange: (partial: Partial<UserFormState>) => void;
  onSave: () => void;
  onSendPasswordReset?: () => void;
};

export function UserEditModal({
  open,
  editing,
  form,
  roles,
  saving,
  onClose,
  onChange,
  onSave,
  onSendPasswordReset,
}: UserEditModalProps) {
  const isNew = !editing;

  return (
    <LbModal
      open={open}
      onClose={onClose}
      title={isNew ? 'Nuwe gebruiker' : `Wysig: ${editing.display_name ?? editing.username}`}
      className="max-w-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <LbFormField label="Voornaam" htmlFor="user-first-name">
          <LbInput
            id="user-first-name"
            className={inputClass}
            value={form.first_name}
            onChange={(e) => onChange({ first_name: e.target.value })}
          />
        </LbFormField>
        <LbFormField label="Van" htmlFor="user-last-name">
          <LbInput
            id="user-last-name"
            className={inputClass}
            value={form.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
          />
        </LbFormField>
        <LbFormField label="Gebruikersnaam" htmlFor="user-username">
          <LbInput
            id="user-username"
            className={inputClass}
            value={form.username}
            disabled={!isNew}
            onChange={(e) => onChange({ username: e.target.value })}
          />
        </LbFormField>
        <LbFormField label="E-pos" htmlFor="user-email">
          <LbInput
            id="user-email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </LbFormField>
        {isNew ? (
          <p className="m-0 text-sm text-mar-muted sm:col-span-2">
            Na stoor ontvang die gebruiker \'n e-pos om hul wagwoord te stel en die rekening te
            aktiveer. Moenie \'n wagwoord hier invoer nie.
          </p>
        ) : null}
        {!isNew && editing?.is_enabled !== false && editing?.is_active !== false ? (
          <div className="sm:col-span-2">
            <LbButton
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={onSendPasswordReset}
            >
              Stuur wagwoord-herstel-e-pos
            </LbButton>
          </div>
        ) : null}
        <LbFormField label="Telefoon" htmlFor="user-phone">
          <LbInput
            id="user-phone"
            className={inputClass}
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </LbFormField>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.user_type === 'administrator'}
              onChange={(e) =>
                onChange({
                  user_type: e.target.checked ? 'administrator' : 'user',
                  role: e.target.checked ? '' : form.role,
                })
              }
            />
            Administrateur
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_author}
              onChange={(e) => onChange({ is_author: e.target.checked })}
            />
            Outeur
          </label>
          {!isNew ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => onChange({ is_active: e.target.checked })}
              />
              Aktief
            </label>
          ) : null}
        </div>
        {form.user_type !== 'administrator' ? (
          <LbFormField label="Rol" htmlFor="user-role" className="sm:col-span-2">
            <select
              id="user-role"
              className={inputClass}
              value={form.role}
              onChange={(e) => onChange({ role: e.target.value })}
            >
              <option value="">Kies rol…</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </LbFormField>
        ) : null}
        {form.is_author ? (
          <>
            <LbFormField label="Aftekening" htmlFor="user-sign-off">
              <LbInput
                id="user-sign-off"
                className={inputClass}
                value={form.sign_off}
                onChange={(e) => onChange({ sign_off: e.target.value })}
              />
            </LbFormField>
            <LbFormField label="Byline" htmlFor="user-byline">
              <LbInput
                id="user-byline"
                className={inputClass}
                value={form.byline}
                onChange={(e) => onChange({ byline: e.target.value })}
              />
            </LbFormField>
            <LbFormField label="Biografie" htmlFor="user-bio" className="sm:col-span-2">
              <textarea
                id="user-bio"
                className={`${inputClass} min-h-[5rem]`}
                value={form.biography}
                onChange={(e) => onChange({ biography: e.target.value })}
              />
            </LbFormField>
          </>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <LbButton type="button" variant="secondary" onClick={onClose} disabled={saving}>
          Kanselleer
        </LbButton>
        <LbButton type="button" variant="primary" onClick={onSave} disabled={saving}>
          {saving ? 'Stoor…' : 'Stoor'}
        </LbButton>
      </div>
    </LbModal>
  );
}
