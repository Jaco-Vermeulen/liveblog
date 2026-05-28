import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { InstanceSettingsCurrent, RuntimeFeatureFlags } from '@/lib/config/instanceFeaturesTypes';
import { getEnvFeatureFlags, resolveFeatureFlags } from '@/lib/config/resolveFeatureFlags';
import { getInstanceSettingsCurrent } from '@/mechanisms/liveblog-api';
import { LiveblogWsEvent, useWsEvent } from '@/mechanisms/websocket-manager';

type InstanceFeaturesContextValue = {
  settings: InstanceSettingsCurrent | null;
  flags: RuntimeFeatureFlags;
  loading: boolean;
  reload: () => Promise<void>;
  isEnabled: (featureName: string) => boolean;
};

const InstanceFeaturesContext = createContext<InstanceFeaturesContextValue | null>(null);

function InstanceSettingsWsSync({ onReload }: { onReload: () => Promise<void> }) {
  useWsEvent(LiveblogWsEvent.InstanceSettingsUpdated, () => {
    void onReload();
  });
  return null;
}

export function InstanceFeaturesProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<InstanceSettingsCurrent | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const current = await getInstanceSettingsCurrent();
      setSettings(current);
    } catch (err) {
      console.warn('[settings-manager] instance_settings/current failed', err);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const flags = useMemo(
    () => resolveFeatureFlags(settings, getEnvFeatureFlags()),
    [settings],
  );

  const isEnabled = useCallback(
    (featureName: string) => {
      if (settings?.isNetworkSubscription) {
        return true;
      }
      return settings?.features?.[featureName] ?? false;
    },
    [settings],
  );

  const value = useMemo<InstanceFeaturesContextValue>(
    () => ({
      settings,
      flags,
      loading,
      reload,
      isEnabled,
    }),
    [settings, flags, loading, reload, isEnabled],
  );

  return (
    <InstanceFeaturesContext.Provider value={value}>
      <InstanceSettingsWsSync onReload={reload} />
      {children}
    </InstanceFeaturesContext.Provider>
  );
}

export function useInstanceFeatures(): InstanceFeaturesContextValue {
  const ctx = useContext(InstanceFeaturesContext);
  if (!ctx) {
    throw new Error('useInstanceFeatures must be used within InstanceFeaturesProvider');
  }
  return ctx;
}
