import { describe, expect, it } from 'vitest';
import { isBlogPreferenceSettingKey } from './blogPreferenceKeys';

describe('blogPreferenceKeys', () => {
  it('treats language and embed height as settings keys', () => {
    expect(isBlogPreferenceSettingKey('language')).toBe(true);
    expect(isBlogPreferenceSettingKey('embed_height_responsive_default')).toBe(true);
  });

  it('does not treat custom freetype keys as settings keys', () => {
    expect(isBlogPreferenceSettingKey('score_home')).toBe(false);
  });
});
