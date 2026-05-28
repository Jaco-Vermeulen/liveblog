import { api, apiRequest, resolveUrl } from '../client';
import type { EveList, GlobalPreference, StyleSettings, Theme } from '../types';
import { getGlobalPreferenceByKey, saveGlobalPreference } from './settings';

export type ThemeUpdatePayload = {
  settings?: Record<string, unknown>;
  styleSettings?: StyleSettings;
};

export function listThemes(): Promise<EveList<Theme>> {
  return api.get<EveList<Theme>>('/themes', { max_results: 200 });
}

export function getThemeByName(name: string): Promise<Theme> {
  return api.get<Theme>(`/themes/${encodeURIComponent(name)}`);
}

export function updateTheme(theme: Theme, updates: ThemeUpdatePayload): Promise<Theme> {
  // Eve allows GET by theme `name` (additional_lookup) but PATCH only on Mongo `_id`.
  if (!theme._id) {
    throw new Error('Theme _id required for update');
  }
  return api.patch<Theme>(`/themes/${theme._id}`, updates, {
    etag: theme._etag,
  });
}

export function getThemePreferences(): Promise<EveList<GlobalPreference>> {
  return getGlobalPreferenceByKey('theme');
}

export async function getDefaultThemeName(): Promise<string | undefined> {
  const prefs = await getThemePreferences();
  const themePref = prefs._items.find((item) => item.key === 'theme');
  return typeof themePref?.value === 'string' ? themePref.value : undefined;
}

export async function listSelectableThemes(): Promise<Theme[]> {
  const [themes, defaultName] = await Promise.all([listThemes(), getDefaultThemeName()]);
  const items = themes._items.filter((theme) => !theme.abstract);
  if (defaultName) {
    items.sort((a, b) => {
      if (a.name === defaultName) return -1;
      if (b.name === defaultName) return 1;
      return a.name.localeCompare(b.name);
    });
  }
  return items;
}

export async function getDefaultThemePreference(): Promise<GlobalPreference | null> {
  const prefs = await getThemePreferences();
  return prefs._items.find((item) => item.key === 'theme') ?? null;
}

export async function setDefaultTheme(
  themeName: string,
  existing?: GlobalPreference | null,
): Promise<GlobalPreference> {
  return saveGlobalPreference(existing ?? undefined, { key: 'theme', value: themeName });
}

export function removeTheme(theme: Theme): Promise<void> {
  if (!theme._id) {
    throw new Error('Theme id required for delete');
  }
  return api.delete(`/themes/${theme._id}`, { etag: theme._etag });
}

export function redeployTheme(themeName: string): Promise<unknown> {
  return apiRequest(`/theme-redeploy/${encodeURIComponent(themeName)}`, {
    method: 'GET',
  });
}

export async function downloadTheme(themeName: string): Promise<void> {
  const url = resolveUrl(`/theme-download/${encodeURIComponent(themeName)}`);
  const auth =
    typeof localStorage !== 'undefined' ? localStorage.getItem('sess:token') : null;
  const res = await fetch(url, {
    credentials: 'include',
    headers: auth ? { Authorization: auth } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Theme download failed: HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `${themeName}.zip`;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export function uploadTheme(file: File): Promise<unknown> {
  const form = new FormData();
  form.append('media', file);
  return apiRequest('/theme-upload', { method: 'POST', body: form });
}
