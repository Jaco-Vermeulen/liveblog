/** Response from GET /instance_settings/current (legacy featuresService parity). */
export interface InstanceSettingsCurrent {
  features?: Record<string, boolean>;
  limits?: Record<string, number>;
  isNetworkSubscription?: boolean;
}

export type RuntimeFeatureFlags = {
  marketplace: boolean;
  syndication: boolean;
};
