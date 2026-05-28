import type { GlobalPreference, LanguageOption, Theme } from '@/mechanisms/liveblog-api';
import { SETTINGS_KEYS } from './constants';

export type PreferenceValue = string | boolean | string[];

export interface PreferenceField<T extends PreferenceValue = PreferenceValue> {
  value: T;
  record?: GlobalPreference;
}

export interface GeneralSettingsForm {
  language: PreferenceField<string>;
  theme: PreferenceField<string>;
  globalTags: PreferenceField<string[]>;
  allowMultipleTags: PreferenceField<boolean>;
  youtubePrivacy: PreferenceField<'private' | 'public' | 'unlisted'>;
  embedHeightResponsive: PreferenceField<boolean>;
  quotationMarks: PreferenceField<'af' | 'en' | 'de'>;
}

export function defaultGeneralSettings(): GeneralSettingsForm {
  return {
    language: { value: '' },
    theme: { value: '' },
    globalTags: { value: [] },
    allowMultipleTags: { value: true },
    youtubePrivacy: { value: 'unlisted' },
    embedHeightResponsive: { value: true },
    quotationMarks: { value: 'en' },
  };
}

export function mapPreferencesToForm(
  items: GlobalPreference[],
  themes: Theme[],
  languages: LanguageOption[],
): GeneralSettingsForm {
  const form = defaultGeneralSettings();
  const byKey = new Map(items.map((item) => [item.key, item]));

  const assign = <K extends keyof typeof SETTINGS_KEYS>(
    key: (typeof SETTINGS_KEYS)[K],
    field: keyof GeneralSettingsForm,
    fallback: PreferenceValue,
  ) => {
    const record = byKey.get(key);
    const raw = record?.value ?? fallback;
    (form[field] as PreferenceField) = {
      value: raw as PreferenceValue,
      record,
    };
  };

  assign(SETTINGS_KEYS.language, 'language', '');
  assign(SETTINGS_KEYS.theme, 'theme', themes[0]?.name ?? '');
  assign(SETTINGS_KEYS.globalTags, 'globalTags', []);
  assign(SETTINGS_KEYS.allowMultipleTags, 'allowMultipleTags', true);
  assign(SETTINGS_KEYS.youtubePrivacy, 'youtubePrivacy', 'unlisted');
  assign(SETTINGS_KEYS.embedHeightResponsive, 'embedHeightResponsive', true);
  assign(SETTINGS_KEYS.quotationMarks, 'quotationMarks', 'en');

  void languages;
  return form;
}

export function formToPreferencePatches(form: GeneralSettingsForm): Array<{
  key: string;
  value: unknown;
  record?: GlobalPreference;
}> {
  return [
    { key: SETTINGS_KEYS.language, value: form.language.value, record: form.language.record },
    { key: SETTINGS_KEYS.theme, value: form.theme.value, record: form.theme.record },
    { key: SETTINGS_KEYS.globalTags, value: form.globalTags.value, record: form.globalTags.record },
    {
      key: SETTINGS_KEYS.allowMultipleTags,
      value: form.allowMultipleTags.value,
      record: form.allowMultipleTags.record,
    },
    {
      key: SETTINGS_KEYS.youtubePrivacy,
      value: form.youtubePrivacy.value,
      record: form.youtubePrivacy.record,
    },
    {
      key: SETTINGS_KEYS.embedHeightResponsive,
      value: form.embedHeightResponsive.value,
      record: form.embedHeightResponsive.record,
    },
    {
      key: SETTINGS_KEYS.quotationMarks,
      value: form.quotationMarks.value,
      record: form.quotationMarks.record,
    },
  ];
}
