/** Keys in `blog_preferences` that belong on blog settings, not freetype template fields. */
export const BLOG_PREFERENCE_SETTINGS_KEYS = new Set([
  'language',
  'embed_height_responsive_default',
  'last_scorecard',
  'theme',
]);

export function isBlogPreferenceSettingKey(key: string): boolean {
  return BLOG_PREFERENCE_SETTINGS_KEYS.has(key);
}
