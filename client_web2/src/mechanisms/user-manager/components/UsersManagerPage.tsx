import { AF } from '@/copy';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbBadge } from '@/components/ui/LbBadge';
import { LbButton } from '@/components/ui/LbButton';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbInput } from '@/components/ui/LbInput';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { PasswordResetSuccessModal } from '@/mechanisms/auth-manager/components/PasswordResetSuccessModal';
import { useUsersManager } from '../hooks/useUsersManager';
import { UserEditModal } from './UserEditModal';

function statusBadge(user: { is_enabled?: boolean; is_active?: boolean }) {
  if (user.is_enabled === false) {
    return <LbBadge variant="muted">{AF.users.status.deactivated}</LbBadge>;
  }
  if (user.is_active === false) {
    return <LbBadge variant="orange">{AF.users.status.inactive}</LbBadge>;
  }
  return <LbBadge variant="teal">{AF.users.status.active}</LbBadge>;
}

export function UsersManagerPage() {
  const {
    users,
    roles,
    search,
    setSearch,
    loading,
    saving,
    error,
    message,
    modalOpen,
    passwordResetSuccessOpen,
    closePasswordResetSuccess,
    editing,
    form,
    updateForm,
    openCreate,
    openEdit,
    closeModal,
    save,
    toggleActive,
    disable,
    reactivate,
    sendPasswordReset,
  } = useUsersManager();

  if (loading) {
    return (
      <LbContentContainer size="full" centered className="py-16">
        <LbSpinner tone="dark" />
        <p className="mt-3 text-sm text-mar-muted">{AF.users.loading}</p>
      </LbContentContainer>
    );
  }

  return (
    <LbContentContainer size="full" centered={false} className="py-6">
      <div className="mb-6 flex min-w-0 flex-wrap items-center justify-between gap-3">
        <p className="m-0 min-w-0 flex-1 text-sm text-mar-muted">
          Skep, wysig, deaktiveer en heraktiveer Liveblog-gebruikers.
        </p>
        <LbButton type="button" variant="primary" className="shrink-0" onClick={openCreate}>
          Nuwe gebruiker
        </LbButton>
      </div>

      <div className="mb-6 min-w-0">
        <LbInput
          type="search"
          placeholder={AF.users.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
          aria-label={AF.users.searchAria}
        />
      </div>

      {error && (
        <LbAlert variant="error" className="mb-4">
          {error}
        </LbAlert>
      )}
      {message && (
        <LbAlert variant="info" className="mb-4">
          {message}
        </LbAlert>
      )}

      <div className="min-w-0 w-full overflow-x-auto rounded border border-mar-border bg-mar-panel">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-mar-border bg-mar-beige text-mar-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Naam</th>
              <th className="px-4 py-3 font-medium">Gebruikersnaam</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Aksies</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mar-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-mar-muted">
                  {AF.users.noUsersFound}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-mar-beige/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-mar-text">
                      {user.display_name ??
                        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()}
                    </div>
                    <div className="text-xs text-mar-muted">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3 capitalize">{user.user_type ?? 'user'}</td>
                  <td className="px-4 py-3">{statusBadge(user)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <LbButton
                        type="button"
                        variant="secondary"
                        onClick={() => void openEdit(user)}
                        disabled={saving}
                      >
                        Wysig
                      </LbButton>
                      {user.is_enabled === false ? (
                        <LbButton
                          type="button"
                          variant="primary"
                          onClick={() => void reactivate(user)}
                          disabled={saving}
                        >
                          Heraktiveer
                        </LbButton>
                      ) : (
                        <>
                          <LbButton
                            type="button"
                            variant="secondary"
                            onClick={() => void toggleActive(user)}
                            disabled={saving}
                          >
                            {user.is_active === false ? 'Aktiveer' : 'Deaktiveer'}
                          </LbButton>
                          <LbButton
                            type="button"
                            variant="ghost"
                            onClick={() => void disable(user)}
                            disabled={saving}
                          >
                            Verwyder
                          </LbButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PasswordResetSuccessModal
        open={passwordResetSuccessOpen}
        kind="email-sent"
        onClose={closePasswordResetSuccess}
      />

      <UserEditModal
        open={modalOpen}
        editing={editing}
        form={form}
        roles={roles}
        saving={saving}
        onClose={closeModal}
        onChange={updateForm}
        onSave={() => void save()}
        onSendPasswordReset={
          editing ? () => void sendPasswordReset(editing) : undefined
        }
      />
    </LbContentContainer>
  );
}
