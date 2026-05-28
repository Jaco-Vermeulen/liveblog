import type { InstanceSettingsCurrent, RuntimeFeatureFlags } from './instanceFeaturesTypes';

/** Build-time overrides (legacy superdeskConfig / Vite env). */
export function getEnvFeatureFlags(): RuntimeFeatureFlags {
  return {
    marketplace: import.meta.env.VITE_MARKETPLACE === 'true',
    syndication: import.meta.env.VITE_SYNDICATION === 'true',
  };
}

/**
 * Merge API subscription features with env flags.
 * Network subscription enables all gated admin modules (legacy featuresService).
 */
export function resolveFeatureFlags(
  current: InstanceSettingsCurrent | null,
  env: RuntimeFeatureFlags = getEnvFeatureFlags(),
): RuntimeFeatureFlags {
  if (!current) {
    return env;
  }

  if (current.isNetworkSubscription) {
    return { marketplace: true, syndication: true };
  }

  const features = current.features ?? {};
  return {
    marketplace: features.marketplace ?? env.marketplace,
    syndication: features.syndication ?? env.syndication,
  };
}
