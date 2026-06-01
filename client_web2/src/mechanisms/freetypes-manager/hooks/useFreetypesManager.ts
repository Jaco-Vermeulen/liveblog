import { useCallback, useEffect, useState } from 'react';
import { AF } from '@/copy';
import {
  checkFreetypeUsed,
  listFreetypes,
  removeFreetype,
  saveFreetype,
  type Freetype,
} from '@/mechanisms/liveblog-api';
import { validateFreetypeName, validateFreetypeTemplate } from '../utils/validateFreetype';

export function useFreetypesManager() {
  const [freetypes, setFreetypes] = useState<Freetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Freetype | null>(null);
  const [dialog, setDialog] = useState({ name: '', template: '' });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listFreetypes();
      const items = await Promise.all(
        data._items.map(async (item) => ({
          ...item,
          isUsed: await checkFreetypeUsed(item.name).catch(() => false),
        })),
      );
      setFreetypes(items as (Freetype & { isUsed?: boolean })[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.freetypes.errors.load);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openDialog = (freetype?: Freetype) => {
    setEditing(freetype ?? null);
    setDialog({
      name: freetype?.name ?? '',
      template: freetype?.template ?? '',
    });
    setModalOpen(true);
    setMessage(null);
  };

  const closeDialog = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const save = async () => {
    const templateCheck = validateFreetypeTemplate(dialog.template);
    if (!templateCheck.valid) {
      setError(AF.freetypes.validation.templateVars);
      return;
    }
    if (!validateFreetypeName(dialog.name, freetypes, editing?._id)) {
      setError(AF.freetypes.validation.uniqueName);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveFreetype(editing, { name: dialog.name, template: dialog.template });
      setMessage(editing ? AF.freetypes.messages.updated : AF.freetypes.messages.created);
      closeDialog();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.freetypes.errors.save);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (freetype: Freetype) => {
    if (!window.confirm(AF.freetypes.confirmDelete(freetype.name))) return;
    setSaving(true);
    setError(null);
    try {
      await removeFreetype(freetype);
      setMessage(AF.freetypes.messages.removed);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.freetypes.errors.delete);
    } finally {
      setSaving(false);
    }
  };

  return {
    freetypes,
    loading,
    saving,
    error,
    message,
    modalOpen,
    editing,
    dialog,
    setDialog,
    openDialog,
    closeDialog,
    save,
    remove,
    refresh,
  };
}
