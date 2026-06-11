import type { StyleSettings, Theme, ThemeStyleGroup } from '@/mechanisms/liveblog-api';

/**
 * Rewrites theme asset URLs to same-origin paths in dev so Vite proxies
 * `/themes_assets` and `/themes_uploads` to the liveblog server.
 */
export function normalizeThemeAssetUrl(url: string): string {
  if (!url?.trim()) return url;
  try {
    const parsed = url.startsWith('http')
      ? new URL(url)
      : new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

    const path = `${parsed.pathname}${parsed.search}`;
    if (path.startsWith('/themes_assets/') || path.startsWith('/themes_uploads/')) {
      if (import.meta.env.DEV) return path;
    }

    if (import.meta.env.DEV) {
      const apiBase = import.meta.env.VITE_LIVEBLOG_API_URL ?? 'http://localhost:5000/api';
      const serverOrigin = apiBase.replace(/\/api\/?$/i, '');
      try {
        const server = new URL(serverOrigin);
        if (
          parsed.origin === server.origin &&
          (path.startsWith('/themes_assets') || path.startsWith('/themes_uploads'))
        ) {
          return path;
        }
      } catch {
        /* ignore */
      }
    }

    return url.startsWith('http') ? url : path;
  } catch {
    return url;
  }
}

/** Parent themes first, then child — e.g. default → maroela. */
export function resolveThemeChain(theme: Theme, allThemes: Theme[]): Theme[] {
  const chain: Theme[] = [];
  const seen = new Set<string>();
  let current: Theme | undefined = theme;

  while (current && !seen.has(current.name)) {
    seen.add(current.name);
    chain.unshift(current);
    const parentName: string | undefined = current.extends;
    if (!parentName || parentName === current.name) break;
    current = allThemes.find((t) => t.name === parentName);
  }

  return chain;
}

function buildCssSelector(groupSelector: string, tagName?: string): string {
  if (!tagName?.trim()) return groupSelector.trim();
  if (groupSelector.includes(',')) {
    return groupSelector
      .split(',')
      .map((part) => `${part.trim()} ${tagName}`)
      .join(', ');
  }
  return `${groupSelector} ${tagName}`.trim();
}

function styleSettingValue(
  settings: StyleSettings,
  groupName: string,
  property: string,
  defaultValue?: string | null,
): string | null | undefined {
  const group = settings[groupName];
  const value = group?.[property];
  if (value) return String(value);
  if (
    groupName === 'page' &&
    property === 'background-color' &&
    settings.general?.background
  ) {
    return String(settings.general.background);
  }
  return defaultValue ?? undefined;
}

/** Mirrors server `generate_theme_styles` for editor preview (React fallback path). */
export function buildThemeStyleSettingsCss(theme: Theme): string {
  if (!theme.supportStylesSettings || !theme.styleOptions?.length || !theme.styleSettings) {
    return '';
  }

  const rules = new Map<string, string[]>();

  for (const group of theme.styleOptions as ThemeStyleGroup[]) {
    if (group.serializerIgnore || !group.cssSelector) continue;

    for (const option of group.options ?? []) {
      const property = option.property;
      if (!property) continue;

      const raw = styleSettingValue(
        theme.styleSettings,
        group.name,
        property,
        option.default ?? null,
      );
      if (!raw) continue;

      const value =
        option.type === 'colorpicker' && !raw.includes('!important')
          ? `${raw} !important`
          : raw;

      const cssVariables = (option as { cssVariables?: string[] }).cssVariables ?? [];
      if (cssVariables.length > 0) {
        const rootProps = rules.get(':root') ?? [];
        for (const varName of cssVariables) {
          rootProps.push(`${varName}: ${value}`);
        }
        rules.set(':root', rootProps);
      }

      const selector = buildCssSelector(group.cssSelector, option.tagName);
      const existing = rules.get(selector) ?? [];
      existing.push(`${property}: ${value}`);
      rules.set(selector, existing);
    }
  }

  return Array.from(rules.entries())
    .map(([selector, props]) => `${selector} { ${props.join('; ')} }`)
    .join('\n');
}

export function buildThemeStylesheetUrls(theme: Theme, allThemes: Theme[]): string[] {
  const urls: string[] = [];
  for (const t of resolveThemeChain(theme, allThemes)) {
    const base = t.public_url?.replace(/\/$/, '');
    const paths = t.styles;
    if (!base || !paths?.length) continue;
    for (const path of paths) {
      const normalized = path.startsWith('/') ? path.slice(1) : path;
      urls.push(normalizeThemeAssetUrl(`${base}/${normalized}`));
    }
  }
  return urls;
}
