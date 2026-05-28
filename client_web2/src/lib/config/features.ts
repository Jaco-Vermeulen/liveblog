import { getEnvFeatureFlags } from './resolveFeatureFlags';

/** @deprecated Prefer `useInstanceFeatures().flags` when inside React tree. */
export function getFeatureFlags() {
  return getEnvFeatureFlags();
}
