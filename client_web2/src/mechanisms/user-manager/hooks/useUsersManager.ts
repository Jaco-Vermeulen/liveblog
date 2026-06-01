import { useCallback, useEffect, useState } from 'react';
import { AF } from '@/copy';
import {
  createUser,
  disableUser,
  getUser,
  listRoles,
  passwordResetErrorMessage,
  requestPasswordReset,
  searchUsers,
  updateUser,
  type LiveblogRole,
  type LiveblogUser,
} from '@/mechanisms/liveblog-api';
import {
  emptyUserForm,
  formToAdminPatch,
  formToCreateBody,
  isUserFormDirty,
  reactivateUserPatch,
  userToForm,
  validateUserForm,
  type UserFormState,
} from '../utils/userForm';

export function useUsersManager() {
  const [users, setUsers] = useState<LiveblogUser[]>([]);
  const [roles, setRoles] = useState<LiveblogRole[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordResetSuccessOpen, setPasswordResetSuccessOpen] = useState(false);
  const [editing, setEditing] = useState<LiveblogUser | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyUserForm);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, roleRes] = await Promise.all([
        searchUsers({ search, adminList: true, maxResults: 100 }),
        listRoles(),
      ]);
      setUsers(userRes._items);
      setRoles(roleRes._items);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.users.errors.load);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyUserForm());
    setModalOpen(true);
    setMessage(null);
    setError(null);
  };

  const openEdit = async (user: LiveblogUser) => {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const full = await getUser(user._id);
      setEditing(full);
      setForm(userToForm(full));
      setModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.users.errors.loadOne);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyUserForm());
  };

  const updateForm = (partial: Partial<UserFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setMessage(null);
  };

  const save = async () => {
    const isNew = !editing;
    const check = validateUserForm(form, isNew);
    if (!check.valid) {
      setError(check.error ?? 'Ongeldige vorm.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const created = await createUser(formToCreateBody(form));
        const email = created.email ?? form.email.trim();
        try {
          await requestPasswordReset(email);
          setMessage(
            'Gebruiker geskep. \'n Aktiverings-e-pos met wagwoord-skakel is gestuur.',
          );
        } catch (resetErr) {
          setMessage(
            `Gebruiker geskep, maar aktiverings-e-pos kon nie gestuur word nie: ${passwordResetErrorMessage(resetErr)}`,
          );
        }
      } else if (editing._etag) {
        const patch = formToAdminPatch(form, editing);
        if (!Object.keys(patch).length) {
          setMessage(AF.users.errors.noChanges);
          closeModal();
          return;
        }
        await updateUser(editing._id, patch, editing._etag);
        setMessage('Gebruiker opgedateer.');
      }
      closeModal();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.users.errors.save);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: LiveblogUser) => {
    if (!user._etag) return;
    const nextActive = user.is_active === false;
    setSaving(true);
    setError(null);
    try {
      await updateUser(user._id, { is_active: nextActive }, user._etag);
      setMessage(nextActive ? 'Gebruiker geaktiveer.' : 'Gebruiker gedeaktiveer.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.users.errors.status);
    } finally {
      setSaving(false);
    }
  };

  const disable = async (user: LiveblogUser) => {
    if (!user._etag) return;
    if (!window.confirm(`Deaktiveer gebruiker "${user.display_name ?? user.username}"?`)) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await disableUser(user._id, user._etag);
      setMessage('Gebruiker gedeaktiveer.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.users.errors.deactivate);
    } finally {
      setSaving(false);
    }
  };

  const reactivate = async (user: LiveblogUser) => {
    const label = user.display_name ?? user.username;
    if (
      !window.confirm(
        `Heraktiveer gebruiker "${label}"?\n\nHulle kan weer aanmeld nadat hul wagwoord gestel is.`,
      )
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const full = user._etag ? user : await getUser(user._id);
      if (!full._etag) {
        setError(AF.users.errors.loadOne);
        return;
      }
      await updateUser(
        full._id,
        reactivateUserPatch(),
        full._etag,
      );
      const email = full.email?.trim();
      if (email && window.confirm(`Stuur wagwoord-herstel-e-pos na ${email}?`)) {
        try {
          await requestPasswordReset(email);
          setMessage('Gebruiker heraktiveer. Wagwoord-herstel-e-pos gestuur.');
        } catch (resetErr) {
          setMessage(
            `Gebruiker heraktiveer, maar e-pos kon nie gestuur word nie: ${passwordResetErrorMessage(resetErr)}`,
          );
        }
      } else {
        setMessage('Gebruiker heraktiveer.');
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.users.errors.reactivate);
    } finally {
      setSaving(false);
    }
  };

  const sendPasswordReset = async (target: LiveblogUser) => {
    const email = target.email?.trim();
    if (!email) {
      setError('Gebruiker het geen e-posadres nie.');
      return;
    }
    if (
      !window.confirm(
        `Stuur wagwoord-herstel / aktiverings-e-pos na ${email}?`,
      )
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setPasswordResetSuccessOpen(true);
    } catch (err) {
      setError(passwordResetErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isDirty = editing ? isUserFormDirty(form, editing) : true;

  return {
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
    closePasswordResetSuccess: () => setPasswordResetSuccessOpen(false),
    editing,
    form,
    isDirty,
    updateForm,
    openCreate,
    openEdit,
    closeModal,
    save,
    toggleActive,
    disable,
    reactivate,
    sendPasswordReset,
    refresh,
  };
}
