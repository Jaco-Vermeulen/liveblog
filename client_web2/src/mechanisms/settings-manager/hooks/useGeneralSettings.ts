import { useCallback, useEffect, useState } from 'react';
import { AF } from '@/copy';
import {
  listGlobalPreferences,
  listLanguages,
  listThemesForSettings,
  saveGlobalPreference,
} from '@/mechanisms/liveblog-api';
import type { LanguageOption, Theme } from '@/mechanisms/liveblog-api';
import {
  defaultGeneralSettings,
  formToPreferencePatches,
  mapPreferencesToForm,
  type GeneralSettingsForm,
} from '../types';

export function useGeneralSettings() {
  const [form, setForm] = useState<GeneralSettingsForm>(defaultGeneralSettings);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prefs, themeItems, languageItems] = await Promise.all([
        listGlobalPreferences(),
        listThemesForSettings(),
        listLanguages(),
      ]);
      setThemes(themeItems);
      setLanguages(languageItems._items);
      setForm(mapPreferencesToForm(prefs._items, themeItems, languageItems._items));
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.settings.errors.load);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateForm = (patch: Partial<GeneralSettingsForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
    setSaveMessage(null);
  };

  const setTags = (tags: string[]) => {
    setForm((prev) => ({
      ...prev,
      globalTags: { ...prev.globalTags, value: tags },
    }));
    setIsDirty(true);
    setSaveMessage(null);
  };

  const setBlogCategories = (categories: string[]) => {
    setForm((prev) => ({
      ...prev,
      blogCategories: { ...prev.blogCategories, value: categories },
    }));
    setIsDirty(true);
    setSaveMessage(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const patches = formToPreferencePatches(form);
      await Promise.all(
        patches.map((item) =>
          saveGlobalPreference(item.record, { key: item.key, value: item.value }),
        ),
      );
      setIsDirty(false);
      setSaveMessage(AF.settings.saveSuccess);
      await load();
    } catch {
      setError(AF.settings.errors.save);
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    themes,
    languages,
    loading,
    saving,
    isDirty,
    error,
    saveMessage,
    updateForm,
    setTags,
    setBlogCategories,
    save,
    reload: load,
  };
}
