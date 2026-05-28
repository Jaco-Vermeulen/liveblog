import { useCallback, useEffect, useMemo, useState } from 'react';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbModal } from '@/components/ui/LbModal';
import { LbSpinner } from '@/components/ui/LbSpinner';
import {
  getThemeByName,
  updateTheme,
  type StyleSettings,
  type Theme,
  type ThemeSettingOption,
  type ThemeStyleGroup,
} from '@/mechanisms/liveblog-api';
import { useInstanceFeatures } from '@/mechanisms/settings-manager';
import {
  applyOptionDefaults,
  buildDefaultStyleSettings,
  collectThemeOptions,
  resolveThemeStyleOptionsAndSettings,
} from '../services/themeUtils';
import { stylesTabReducer, StylesTabActions } from './stylesTab/actions';
import { StylesTab } from './stylesTab/StylesTab';
import { ThemeSettingsOptionsTab } from './ThemeSettingsOptionsTab';

const TAB_SETTINGS = 'Instellings';
const TAB_STYLES = 'Style';

type ThemeSettingsModalProps = {
  theme: Theme | null;
  allThemes: Theme[];
  open: boolean;
  onClose(): void;
  onSaved?(theme: Theme): void;
};

function mergeDefaultStyles(current: StyleSettings, defaults: StyleSettings): StyleSettings {
  const seed = {
    defaultSettings: defaults,
    settings: structuredClone(current),
    styleOptions: [] as ThemeStyleGroup[],
  };
  return stylesTabReducer(seed, { type: StylesTabActions.resetStylesSettings })
    .settings;
}

export function ThemeSettingsModal({
  theme,
  allThemes,
  open,
  onClose,
  onSaved,
}: ThemeSettingsModalProps) {
  const { isEnabled } = useInstanceFeatures();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(TAB_SETTINGS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [loadedTheme, setLoadedTheme] = useState<Theme | null>(null);
  const [options, setOptions] = useState<ThemeSettingOption[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [styleOptions, setStyleOptions] = useState<ThemeStyleGroup[]>([]);
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({});
  const [defaultStyleSettings, setDefaultStyleSettings] = useState<StyleSettings>({});

  const supportStyles =
    Boolean(loadedTheme?.supportStylesSettings) && isEnabled('theme_styles');

  const tabs = useMemo(() => {
    const list = [TAB_SETTINGS];
    if (supportStyles) list.push(TAB_STYLES);
    return list;
  }, [supportStyles]);

  const themeNames = useMemo(
    () => allThemes.map((t) => ({ name: t.name, label: t.label })),
    [allThemes],
  );

  const loadThemeData = useCallback(async (seed: Theme) => {
    setLoading(true);
    setError(null);
    try {
      const full = await getThemeByName(seed.name);
      const [collectedOptions, styleResolved, defaults] = await Promise.all([
        collectThemeOptions<ThemeSettingOption>(full, 'options', []),
        resolveThemeStyleOptionsAndSettings(full),
        buildDefaultStyleSettings(full),
      ]);

      const initialSettings = applyOptionDefaults(
        structuredClone(full.settings ?? {}),
        collectedOptions,
      );

      setLoadedTheme(full);
      setOptions(collectedOptions);
      setSettings(initialSettings);
      setStyleOptions(styleResolved.styleOptions);
      setStyleSettings(styleResolved.styleSettings);
      setDefaultStyleSettings(defaults);
      setDirty(false);
      setActiveTab(TAB_SETTINGS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon nie tema-instellings laai nie.');
      setLoadedTheme(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && theme) {
      void loadThemeData(theme);
    } else if (!open) {
      setLoadedTheme(null);
      setDirty(false);
      setError(null);
    }
  }, [open, theme, loadThemeData]);

  const handleSave = async () => {
    if (!loadedTheme) return;

    setSaving(true);
    setError(null);
    try {
      const saved = await updateTheme(loadedTheme, {
        settings,
        styleSettings,
      });
      setLoadedTheme(saved);
      setSettings(structuredClone(saved.settings ?? {}));
      if (saved.styleSettings) {
        setStyleSettings(structuredClone(saved.styleSettings));
      }
      setDirty(false);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon nie instellings stoor nie.');
    } finally {
      setSaving(false);
    }
  };

  const title = loadedTheme
    ? `Tema-instellings: ${loadedTheme.label ?? loadedTheme.name}`
    : 'Tema-instellings';

  return (
    <LbModal
      open={open}
      onClose={onClose}
      title={title}
      className="flex max-h-[90vh] max-w-4xl flex-col"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div>
            {supportStyles && activeTab === TAB_STYLES && (
              <LbButton
                type="button"
                variant="secondary"
                disabled={saving || loading}
                onClick={() => {
                  setStyleSettings((prev) => mergeDefaultStyles(prev, defaultStyleSettings));
                  setDirty(true);
                }}
              >
                Herstel style
              </LbButton>
            )}
          </div>
          <div className="flex gap-2">
            <LbButton type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Kanselleer
            </LbButton>
            <LbButton
              type="button"
              variant="primary"
              disabled={saving || loading || !dirty}
              onClick={() => void handleSave()}
            >
              {saving ? 'Stoor…' : 'Stoor'}
            </LbButton>
          </div>
        </div>
      }
    >
      {error && (
        <LbAlert variant="error" className="mb-4">
          {error}
        </LbAlert>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-12">
          <LbSpinner tone="dark" />
          <p className="mt-3 text-sm text-mar-muted">Laai opsies…</p>
        </div>
      ) : loadedTheme ? (
        <>
          <div className="mb-4 flex gap-2 border-b border-mar-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`border-b-2 px-3 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-mar-accent text-mar-accent'
                    : 'border-transparent text-mar-muted hover:text-mar-text'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-h-[55vh] overflow-y-auto pr-1">
            {activeTab === TAB_SETTINGS && (
              <ThemeSettingsOptionsTab
                options={options}
                settings={settings}
                themeNames={themeNames}
                showAdvanced={showAdvanced}
                onShowAdvancedChange={setShowAdvanced}
                onChange={(next) => {
                  setSettings(next);
                  setDirty(true);
                }}
              />
            )}

            {activeTab === TAB_STYLES && supportStyles && (
              <StylesTab
                key={`${loadedTheme.name}-${loadedTheme._etag ?? 'new'}`}
                defaultSettings={defaultStyleSettings}
                settings={styleSettings}
                styleOptions={styleOptions}
                googleApiKey={import.meta.env.VITE_GOOGLE_FONTS_KEY as string | undefined}
                onChange={(next) => {
                  setStyleSettings(next);
                  setDirty(true);
                }}
              />
            )}
          </div>
        </>
      ) : null}
    </LbModal>
  );
}
