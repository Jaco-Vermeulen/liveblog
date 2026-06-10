import { describe, expect, it } from 'vitest';
import { SETTINGS_KEYS } from './constants';
import { defaultGeneralSettings, formToPreferencePatches, mapPreferencesToForm } from './types';

describe('settings-manager types', () => {
  it('maps API preferences into form defaults', () => {
    const form = mapPreferencesToForm(
      [
        { _id: '1', key: SETTINGS_KEYS.theme, value: 'default' },
        { _id: '2', key: SETTINGS_KEYS.globalTags, value: ['news', 'sport'] },
      ],
      [{ _id: 't1', name: 'default', label: 'Default' }],
      [],
    );
    expect(form.theme.value).toBe('default');
    expect(form.globalTags.value).toEqual(['news', 'sport']);
  });

  it('builds patch list for all allowed keys', () => {
    const patches = formToPreferencePatches(defaultGeneralSettings());
    expect(patches).toHaveLength(8);
    expect(patches.map((p) => p.key)).toContain(SETTINGS_KEYS.blogCategories);
  });
});
