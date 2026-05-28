import { useState } from 'react';
import { LbContentContainer } from '@/components/layout';
import { LbAlert, LbButton, LbFormField, LbInput, LbPanelCard, LbSpinner } from '@/components/ui';
import { useProfile } from '../hooks/useProfile';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileToolbar } from './ProfileToolbar';

const inputClass =
  'w-full rounded border border-mar-border bg-mar-input px-3 py-2 text-sm text-mar-text disabled:bg-mar-beige disabled:text-mar-muted';

function formatMemberSince(created?: string): string {
  if (!created) return '—';
  try {
    return new Intl.DateTimeFormat('af-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(created));
  } catch {
    return created;
  }
}

export function ProfilePage() {
  const {
    user,
    form,
    tab,
    setTab,
    loading,
    saving,
    error,
    saveMessage,
    isDirty,
    updateForm,
    save,
    cancel,
    changePassword,
    uploadAvatar,
    avatarUploading,
  } = useProfile();
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (loading || !form || !user) {
    return (
      <LbContentContainer size="lg" centered className="py-16">
        <LbSpinner tone="dark" />
        <p className="mt-3 text-sm text-mar-muted">Laai profiel…</p>
      </LbContentContainer>
    );
  }

  const displayName = user.display_name ?? user.username;

  return (
    <LbContentContainer size="lg" centered={false} className="py-6">
      <ProfileToolbar onSave={() => void save()} saving={saving} saveDisabled={!isDirty} />

      {error && (
        <LbAlert variant="error" className="mb-4">
          {error}
        </LbAlert>
      )}
      {saveMessage && (
        <LbAlert variant="info" className="mb-4" role="status">
          {saveMessage}
        </LbAlert>
      )}

      <LbPanelCard title="My profiel" padding="md" className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ProfileAvatar
            user={user}
            displayName={displayName}
            uploading={avatarUploading}
            onUpload={uploadAvatar}
          />
          <div>
            <h1 className="m-0 text-xl font-bold text-mar-text">{displayName}</h1>
            <p className="m-0 text-sm text-mar-muted">@{user.username}</p>
            <p className="m-0 mt-1 text-sm text-mar-muted">
              Lid sedert {formatMemberSince(user._created)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-mar-border">
          <button
            type="button"
            className={`border-b-2 px-3 py-2 text-sm font-semibold ${
              tab === 'general'
                ? 'border-mar-teal text-mar-teal-dark'
                : 'border-transparent text-mar-muted hover:text-mar-text'
            }`}
            onClick={() => setTab('general')}
          >
            Algemeen
          </button>
          {form.is_author && (
            <button
              type="button"
              className={`border-b-2 px-3 py-2 text-sm font-semibold ${
                tab === 'author'
                  ? 'border-mar-teal text-mar-teal-dark'
                  : 'border-transparent text-mar-muted hover:text-mar-text'
              }`}
              onClick={() => setTab('author')}
            >
              Outeur
            </button>
          )}
        </div>
      </LbPanelCard>

      <form
        className="grid gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        {tab === 'general' && (
          <LbPanelCard title="Algemene inligting" padding="md">
            <div className="grid gap-4 md:grid-cols-2">
              <LbFormField label="Voornaam" htmlFor="profile-first">
                <LbInput
                  id="profile-first"
                  className={inputClass}
                  required
                  value={form.first_name}
                  onChange={(e) => updateForm({ first_name: e.target.value })}
                />
              </LbFormField>
              <LbFormField label="Van" htmlFor="profile-last">
                <LbInput
                  id="profile-last"
                  className={inputClass}
                  required
                  value={form.last_name}
                  onChange={(e) => updateForm({ last_name: e.target.value })}
                />
              </LbFormField>
              <LbFormField label="Gebruikersnaam" htmlFor="profile-username">
                <LbInput
                  id="profile-username"
                  className={inputClass}
                  value={user.username}
                  disabled
                />
              </LbFormField>
              <LbFormField label="E-pos" htmlFor="profile-email">
                <LbInput
                  id="profile-email"
                  type="email"
                  className={inputClass}
                  required
                  value={form.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                />
              </LbFormField>
              <LbFormField label="Telefoon" htmlFor="profile-phone">
                <LbInput
                  id="profile-phone"
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => updateForm({ phone: e.target.value })}
                />
              </LbFormField>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-mar-border pt-4">
              <span className="text-sm font-semibold text-mar-text">Wagwoord</span>
              <LbButton type="button" variant="secondary" onClick={() => setPasswordOpen(true)}>
                Verander wagwoord
              </LbButton>
            </div>
          </LbPanelCard>
        )}

        {tab === 'author' && form.is_author && (
          <LbPanelCard title="Outeurinligting" padding="md">
            <div className="grid gap-4">
              <LbFormField label="Aftekening" htmlFor="profile-sign-off">
                <LbInput
                  id="profile-sign-off"
                  className={inputClass}
                  value={form.sign_off}
                  onChange={(e) => updateForm({ sign_off: e.target.value })}
                />
              </LbFormField>
              <LbFormField label="Byline" htmlFor="profile-byline">
                <LbInput
                  id="profile-byline"
                  className={inputClass}
                  value={form.byline}
                  onChange={(e) => updateForm({ byline: e.target.value })}
                />
              </LbFormField>
              <LbFormField label="Biografie" htmlFor="profile-bio">
                <textarea
                  id="profile-bio"
                  className={`${inputClass} min-h-[120px] resize-y`}
                  value={form.biography}
                  onChange={(e) => updateForm({ biography: e.target.value })}
                />
              </LbFormField>
            </div>
          </LbPanelCard>
        )}

        {isDirty && (
          <div className="flex justify-end gap-2">
            <LbButton type="button" variant="secondary" onClick={cancel}>
              Herstel
            </LbButton>
            <LbButton type="submit" variant="primary" disabled={saving}>
              {saving ? 'Stoor…' : 'Stoor'}
            </LbButton>
          </div>
        )}
      </form>

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSubmit={changePassword}
      />
    </LbContentContainer>
  );
}
