import { listGlobalPreferences } from '@/mechanisms/liveblog-api';
import { SETTINGS_KEYS } from '@/mechanisms/settings-manager/constants';

export function preferenceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '');
}

export async function fetchBlogCategories(): Promise<string[]> {
  const data = await listGlobalPreferences();
  const pref = data._items.find((item) => item.key === SETTINGS_KEYS.blogCategories);
  return preferenceStringArray(pref?.value);
}
