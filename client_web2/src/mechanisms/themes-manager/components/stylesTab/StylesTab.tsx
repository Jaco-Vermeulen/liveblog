import { useEffect, useReducer, useRef } from 'react';
import type { StyleSettings } from '@/mechanisms/liveblog-api';
import { fetchWebFonts, stylesTabReducer, updateFontOptionsAction } from './actions';
import { StylesTabProvider } from './context';
import { StyleGroup } from './StyleGroup';
import type { StylesTabProps } from './types';

function settingsFingerprint(settings: StyleSettings): string {
  return JSON.stringify(settings);
}

export function StylesTab({
  defaultSettings,
  settings,
  styleOptions,
  fontsOptions: initialFonts,
  googleApiKey,
  onChange,
}: StylesTabProps) {
  const [state, dispatch] = useReducer(stylesTabReducer, {
    defaultSettings,
    settings,
    styleOptions,
    fontsOptions: initialFonts,
  });
  const fingerprint = settingsFingerprint(state.settings);
  const isFirstRun = useRef(true);
  const fontsLoaded = useRef(false);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    onChange(state.settings);
  }, [fingerprint, onChange, state.settings]);

  useEffect(() => {
    const key = googleApiKey?.trim() ?? '';
    if (!key || fontsLoaded.current) return;
    fontsLoaded.current = true;
    void fetchWebFonts(key)
      .then((data) => dispatch(updateFontOptionsAction(data)))
      .catch((err) => {
        console.warn(
          '[themes-manager] Google Fonts API failed — set VITE_GOOGLE_FONTS_KEY for font picker.',
          err,
        );
      });
  }, [googleApiKey]);

  return (
    <StylesTabProvider value={{ state, dispatch }}>
      <div className="space-y-2">
        {state.styleOptions.map((group, idx) => (
          <StyleGroup key={`${group.name}-${idx}`} group={group} />
        ))}
      </div>
    </StylesTabProvider>
  );
}
