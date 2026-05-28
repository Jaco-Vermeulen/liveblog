import type { InstanceSettingsCurrent } from '@/lib/config/instanceFeaturesTypes';
import { api } from '../client';
import type {
  EveList,
  GlobalPreference,
  InstanceSettingsDocument,
  LanguageOption,
  Theme,
} from '../types';

export function listLanguages(): Promise<EveList<LanguageOption>> {
  return api.get<EveList<LanguageOption>>('/languages', { max_results: 200 });
}

export function listThemesWithLabels(): Promise<Theme[]> {
  return listThemesForSettings();
}

export async function listThemesForSettings(): Promise<Theme[]> {
  const data = await api.get<EveList<Theme>>('/themes', { max_results: 200 });
  return data._items.filter((theme) => theme.label !== undefined && theme.label !== '');
}

export function listGlobalPreferences(): Promise<EveList<GlobalPreference>> {
  return api.get<EveList<GlobalPreference>>('/global_preferences', { max_results: 200 });
}

export function getGlobalPreferenceByKey(
  key: string,
): Promise<EveList<GlobalPreference>> {
  return api.get<EveList<GlobalPreference>>('/global_preferences', {
    where: JSON.stringify({ key }),
  });
}

export async function saveGlobalPreference(
  existing: GlobalPreference | undefined,
  patch: { key: string; value: unknown },
): Promise<GlobalPreference> {
  if (existing?._id) {
    return api.patch<GlobalPreference>(
      `/global_preferences/${existing._id}`,
      patch,
      { etag: existing._etag },
    );
  }
  return api.post<GlobalPreference>('/global_preferences', patch);
}

export function listInstanceSettings(): Promise<EveList<InstanceSettingsDocument>> {
  return api.get<EveList<InstanceSettingsDocument>>('/instance_settings', {
    max_results: 1,
  });
}

export async function getInstanceSettingsDocument(): Promise<Record<string, unknown>> {
  const data = await listInstanceSettings();
  return data._items[0]?.settings ?? {};
}

export function saveInstanceSettings(
  settings: Record<string, unknown>,
): Promise<InstanceSettingsDocument> {
  return api.post<InstanceSettingsDocument>('/instance_settings', { settings });
}

/** Subscription-scoped feature flags (legacy `featuresService.initialize`). */
export function getInstanceSettingsCurrent(): Promise<InstanceSettingsCurrent> {
  return api.get<InstanceSettingsCurrent>('/instance_settings/current');
}
