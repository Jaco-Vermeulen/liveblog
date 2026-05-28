import { describe, expect, it } from 'vitest';
import {
  applyOptionDefaults,
  optionRequirementIsSatisfied,
} from './themeUtils';
import type { ThemeSettingOption } from '@/mechanisms/liveblog-api';

describe('themeUtils', () => {
  it('applies option defaults when setting missing', () => {
    const options: ThemeSettingOption[] = [
      { name: 'showTitle', type: 'checkbox', default: true },
      { name: 'postsPerPage', type: 'number', default: 10 },
    ];
    const settings = applyOptionDefaults({ showTitle: false }, options);
    expect(settings.showTitle).toBe(false);
    expect(settings.postsPerPage).toBe(10);
  });

  it('checks dependsOn requirements', () => {
    const option: ThemeSettingOption = {
      name: 'outputChannelTheme',
      type: 'select',
      dependsOn: { outputChannel: true },
    };
    expect(optionRequirementIsSatisfied(option, { outputChannel: true })).toBe(true);
    expect(optionRequirementIsSatisfied(option, { outputChannel: false })).toBe(false);
  });
});
