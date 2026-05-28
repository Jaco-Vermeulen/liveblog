/** Keys persisted via global_preferences (legacy allowedKeys). */
export const SETTINGS_KEYS = {
  language: 'language',
  theme: 'theme',
  globalTags: 'global_tags',
  allowMultipleTags: 'allow_multiple_tag_selection',
  youtubePrivacy: 'youtube_privacy_status',
  embedHeightResponsive: 'embed_height_responsive_default',
  quotationMarks: 'editor_quotation_marks_language',
} as const;

export const ALLOWED_SETTINGS_KEYS = Object.values(SETTINGS_KEYS);

export const PRIVACY_STATUSES = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
  { value: 'unlisted', label: 'Unlisted' },
] as const;

export const QUOTATION_MARKS_OPTIONS = [
  { value: 'af', label: 'Afrikaans' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
] as const;
