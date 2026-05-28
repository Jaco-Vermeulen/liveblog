import { describe, expect, it, vi } from 'vitest';
import type { Theme } from '@/mechanisms/liveblog-api';
import {
  buildThemeStylesheetUrls,
  normalizeThemeAssetUrl,
  resolveThemeChain,
} from './themeAssets';

describe('normalizeThemeAssetUrl', () => {
  it('rewrites localhost theme paths to same-origin in dev', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_LIVEBLOG_API_URL', 'http://localhost:5000/api');
    const out = normalizeThemeAssetUrl(
      'http://localhost:5000/themes_assets/maroela/dist/maroela.css',
    );
    expect(out).toBe('/themes_assets/maroela/dist/maroela.css');
    vi.unstubAllEnvs();
  });

  it('keeps relative theme paths in dev', () => {
    vi.stubEnv('DEV', true);
    expect(normalizeThemeAssetUrl('/themes_assets/maroela/dist/maroela.css')).toBe(
      '/themes_assets/maroela/dist/maroela.css',
    );
    vi.unstubAllEnvs();
  });
});

describe('resolveThemeChain', () => {
  const defaultTheme = {
    name: 'default',
    public_url: 'http://localhost:5000/themes_assets/default/',
    styles: ['dist/default.css'],
  } as Theme;

  const maroela = {
    name: 'maroela',
    extends: 'default',
    public_url: 'http://localhost:5000/themes_assets/maroela/',
    styles: ['dist/maroela.css'],
  } as Theme;

  it('orders parent before child', () => {
    const chain = resolveThemeChain(maroela, [defaultTheme, maroela]);
    expect(chain.map((t) => t.name)).toEqual(['default', 'maroela']);
  });
});

describe('buildThemeStylesheetUrls', () => {
  it('includes parent and child stylesheets', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_LIVEBLOG_API_URL', 'http://localhost:5000/api');

    const defaultTheme = {
      name: 'default',
      public_url: 'http://localhost:5000/themes_assets/default/',
      styles: ['dist/default.css'],
    } as Theme;

    const nuweMaroela = {
      name: 'nuwe-maroela',
      extends: 'default',
      public_url: 'http://localhost:5000/themes_assets/nuwe-maroela/',
      styles: ['dist/nuwe-maroela.css'],
    } as Theme;

    const maroela = {
      name: 'maroela',
      extends: 'nuwe-maroela',
      public_url: 'http://localhost:5000/themes_assets/maroela/',
      styles: ['dist/maroela.css'],
    } as Theme;

    expect(buildThemeStylesheetUrls(maroela, [defaultTheme, nuweMaroela, maroela])).toEqual([
      '/themes_assets/default/dist/default.css',
      '/themes_assets/nuwe-maroela/dist/nuwe-maroela.css',
      '/themes_assets/maroela/dist/maroela.css',
    ]);

    vi.unstubAllEnvs();
  });
});
