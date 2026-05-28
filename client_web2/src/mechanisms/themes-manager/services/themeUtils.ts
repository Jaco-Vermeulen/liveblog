import { getThemeByName } from '@/mechanisms/liveblog-api';
import type {
  StyleSettings,
  Theme,
  ThemeSettingOption,
  ThemeStyleGroup,
} from '@/mechanisms/liveblog-api';

type OptionsAttr = 'options' | 'styleOptions';

/**
 * Collect options from theme and parent chain (child overrides parent).
 * Ports legacy `collectOptions` from `liveblog-themes/theme-utils.ts`.
 */
export async function collectThemeOptions<T extends ThemeSettingOption | ThemeStyleGroup>(
  theme: Theme,
  optsAttr: OptionsAttr = 'options',
  accumulator: T[] = [],
): Promise<T[]> {
  let options = [...accumulator];
  const themeOptions = theme[optsAttr] as T[] | undefined;

  if (themeOptions?.length) {
    const names = new Set(options.map((o) => ('name' in o ? o.name : '')));
    const merged = [
      ...themeOptions.filter((o) => !names.has('name' in o ? o.name : '')),
      ...options,
    ];
    options = merged;
  }

  if (theme.extends) {
    const parent = await getThemeByName(theme.extends);
    return collectThemeOptions(parent, optsAttr, options);
  }

  return options;
}

export async function buildDefaultStyleSettings(theme: Theme): Promise<StyleSettings> {
  const styleSettings: StyleSettings = {};
  const styleOptions = await collectThemeOptions<ThemeStyleGroup>(theme, 'styleOptions', []);

  for (const group of styleOptions) {
    if (!styleSettings[group.name]) {
      styleSettings[group.name] = {};
    }
    for (const option of group.options) {
      styleSettings[group.name][option.property] = option.default ?? null;
    }
  }

  return styleSettings;
}

export async function resolveThemeStyleOptionsAndSettings(theme: Theme): Promise<{
  styleOptions: ThemeStyleGroup[];
  styleSettings: StyleSettings;
}> {
  const styleSettings: StyleSettings = structuredClone(theme.styleSettings ?? {});
  const styleOptions = await collectThemeOptions<ThemeStyleGroup>(theme, 'styleOptions', []);

  for (const group of styleOptions) {
    if (!styleSettings[group.name]) {
      styleSettings[group.name] = {};
    }
    for (const option of group.options) {
      const key = option.property;
      if (styleSettings[group.name][key] === undefined) {
        styleSettings[group.name][key] = option.default ?? null;
      }
    }
  }

  return { styleOptions, styleSettings };
}

export function applyOptionDefaults(
  settings: Record<string, unknown>,
  options: ThemeSettingOption[],
): Record<string, unknown> {
  const next = { ...settings };
  for (const option of options) {
    if (next[option.name] === undefined && option.default !== undefined) {
      next[option.name] = option.default;
    }
  }
  return next;
}

export function optionRequirementIsSatisfied(
  option: ThemeSettingOption,
  settings: Record<string, unknown>,
): boolean {
  if (!option.dependsOn) return true;
  return Object.entries(option.dependsOn).every(([key, value]) => settings[key] === value);
}

export function linkifyHelp(html?: string): string {
  if (!html) return '';
  const stripped = html.replace(/(<([^>]+)>)/gi, '');
  return stripped.replace(
    /((https?:)?\/\/[^\s]*)/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );
}
