import { logger } from '@/mechanisms/request-logger';
import type { FontOption, GoogleFontData, StylesTabState } from './types';
import type { StyleSettings, ThemeStyleGroup } from '@/mechanisms/liveblog-api';

export enum StylesTabActions {
  updateSingleValue = 'updateSingleValue',
  resetStylesSettings = 'resetStylesSettings',
  updateFonts = 'updateFonts',
}

export type StyleTabAction =
  | {
      type: StylesTabActions.updateSingleValue;
      group: ThemeStyleGroup;
      propertyName: string;
      value: unknown;
    }
  | { type: StylesTabActions.resetStylesSettings }
  | { type: StylesTabActions.updateFonts; fonts: FontOption[] };

export async function fetchWebFonts(apiKey: string): Promise<GoogleFontData> {
  const url = `https://content-webfonts.googleapis.com/v1/webfonts?key=${apiKey}&sort=popularity`;
  const id = logger.request('GET', url);
  const started = performance.now();
  try {
    const res = await fetch(url);
    const durationMs = Math.round(performance.now() - started);
    logger.response(id, res.status, durationMs, url);
    if (!res.ok) {
      throw new Error(`Google Fonts API HTTP ${res.status}`);
    }
    return (await res.json()) as GoogleFontData;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(id, message, url);
    throw err;
  }
}

export function updateFontOptionsAction(fontData: GoogleFontData): StyleTabAction {
  const fonts = fontData.items.map((item) => ({
    value: item.family,
    label: item.family,
  }));
  return { type: StylesTabActions.updateFonts, fonts };
}

function deepMergeStyleSettings(
  target: StyleSettings,
  source: StyleSettings,
): StyleSettings {
  const out: StyleSettings = { ...target };
  for (const groupKey of Object.keys(source)) {
    out[groupKey] = {
      ...(target[groupKey] ?? {}),
      ...source[groupKey],
    };
  }
  return out;
}

export function stylesTabReducer(state: StylesTabState, action: StyleTabAction): StylesTabState {
  switch (action.type) {
    case StylesTabActions.updateSingleValue: {
      const { group, propertyName, value } = action;
      const settings = structuredClone(state.settings);
      if (!settings[group.name]) settings[group.name] = {};
      settings[group.name][propertyName] = value;
      return { ...state, settings };
    }
    case StylesTabActions.resetStylesSettings:
      return {
        ...state,
        settings: deepMergeStyleSettings(state.settings, state.defaultSettings),
      };
    case StylesTabActions.updateFonts:
      return { ...state, fontsOptions: action.fonts };
    default:
      return state;
  }
}
