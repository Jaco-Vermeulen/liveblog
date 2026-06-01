import { useCallback, useEffect, useState } from 'react';
import { AF } from '@/copy';
import {
  downloadTheme,
  getDefaultThemePreference,
  listThemes,
  redeployTheme,
  removeTheme,
  setDefaultTheme,
  uploadTheme,
} from '@/mechanisms/liveblog-api';
import type { GlobalPreference, Theme } from '@/mechanisms/liveblog-api';
import { enrichThemeFromApi } from '../services/parseTheme';
import { getHierarchyFromThemes } from '../services/themeHierarchy';

export function useThemesManager() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [hierarchy, setHierarchy] = useState<ReturnType<typeof getHierarchyFromThemes>>({});
  const [globalTheme, setGlobalTheme] = useState<GlobalPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, defaultPref] = await Promise.all([
        listThemes(),
        getDefaultThemePreference(),
      ]);
      const items = data._items.map(enrichThemeFromApi);
      setThemes(items);
      setHierarchy(getHierarchyFromThemes(items));
      setGlobalTheme(defaultPref);
    } catch (err) {
      setError(err instanceof Error ? err.message : AF.themes.errors.load);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (fn: () => Promise<void>, successMsg?: string) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await fn();
      if (successMsg) setMessage(successMsg);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aksie het misluk.');
    } finally {
      setBusy(false);
    }
  };

  const makeDefault = (theme: Theme) =>
    runAction(async () => {
      const saved = await setDefaultTheme(theme.name, globalTheme);
      setGlobalTheme(saved);
    }, 'Verstek tema gestoor.');

  const doRemove = (theme: Theme) =>
    runAction(async () => {
      await removeTheme(theme);
    }, `Tema "${theme.label ?? theme.name}" verwyder.`);

  const doRedeploy = (theme: Theme) =>
    runAction(async () => {
      await redeployTheme(theme.name);
    }, 'Tema herontplooi.');

  const doDownload = async (theme: Theme) => {
    setBusy(true);
    setError(null);
    try {
      await downloadTheme(theme.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aflaai het misluk.');
    } finally {
      setBusy(false);
    }
  };

  const doUpload = async (file: File) => {
    await runAction(async () => {
      await uploadTheme(file);
    }, 'Tema opgelaai.');
  };

  const isDefaultTheme = (theme: Theme) =>
    globalTheme?.value === theme.name ||
    (typeof globalTheme?.value === 'string' && globalTheme.value === theme.name);

  return {
    themes,
    hierarchy,
    globalTheme,
    loading,
    busy,
    error,
    message,
    refresh,
    makeDefault,
    doRemove,
    doRedeploy,
    doDownload,
    doUpload,
    isDefaultTheme,
  };
}
