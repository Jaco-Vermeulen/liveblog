import { useCallback, useEffect, useState } from 'react';
import {
  changeUserPassword,
  getUser,
  LiveblogApiError,
  updateUser,
  uploadUserAvatar,
  type LiveblogUser,
} from '@/mechanisms/liveblog-api';
import { useAuth } from './useAuth';
import {
  isProfileFormDirty,
  profileFormToPatch,
  userToProfileForm,
  type ProfileFormState,
} from '../services/profileForm';

export function useProfile() {
  const { state, refreshUser } = useAuth();
  const [user, setUser] = useState<LiveblogUser | null>(null);
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [tab, setTab] = useState<'general' | 'author'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const load = useCallback(async () => {
    const userId = state.user?._id;
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const full = await getUser(userId);
      setUser(full);
      setForm(userToProfileForm(full));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon nie profiel laai nie');
    } finally {
      setLoading(false);
    }
  }, [state.user?._id]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateForm = useCallback((partial: Partial<ProfileFormState>) => {
    setForm((prev) => (prev ? { ...prev, ...partial } : prev));
    setSaveMessage(null);
  }, []);

  const isDirty = Boolean(user && form && isProfileFormDirty(form, user));

  const save = useCallback(async () => {
    if (!user || !form || !user._etag) return;
    const patch = profileFormToPatch(form, user);
    if (!Object.keys(patch).length) return;

    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const updated = await updateUser(user._id, patch, user._etag);
      setUser(updated);
      setForm(userToProfileForm(updated));
      await refreshUser();
      setSaveMessage('Profiel gestoor.');
    } catch (err) {
      const message =
        err instanceof LiveblogApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Kon nie profiel stoor nie';
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [form, refreshUser, user]);

  const cancel = useCallback(() => {
    if (!user) return;
    setForm(userToProfileForm(user));
    setSaveMessage(null);
    setError(null);
  }, [user]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user?._etag) return;
      setAvatarUploading(true);
      setError(null);
      setSaveMessage(null);
      try {
        const avatarId = await uploadUserAvatar(file);
        const updated = await updateUser(user._id, { avatar: avatarId }, user._etag);
        setUser(updated);
        setForm(userToProfileForm(updated));
        await refreshUser();
        setSaveMessage('Profielfoto opgedateer.');
      } catch (err) {
        const message =
          err instanceof LiveblogApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Kon nie foto oplaai nie';
        setError(message);
        throw err;
      } finally {
        setAvatarUploading(false);
      }
    },
    [refreshUser, user],
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      const username = user?.username ?? state.user?.username;
      if (!username) {
        throw new Error('Geen gebruiker nie');
      }
      await changeUserPassword({
        username,
        old_password: oldPassword,
        new_password: newPassword,
      });
    },
    [state.user?.username, user?.username],
  );

  return {
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
    reload: load,
  };
}
