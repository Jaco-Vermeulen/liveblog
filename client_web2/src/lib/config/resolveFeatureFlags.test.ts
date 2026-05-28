import { describe, expect, it } from 'vitest';
import { getEnvFeatureFlags, resolveFeatureFlags } from './resolveFeatureFlags';

describe('resolveFeatureFlags', () => {
  it('returns env flags when API settings are null', () => {
    const env = { marketplace: true, syndication: false };
    expect(resolveFeatureFlags(null, env)).toEqual(env);
  });

  it('enables all gated modules on network subscription', () => {
    expect(
      resolveFeatureFlags(
        { isNetworkSubscription: true, features: { marketplace: false } },
        { marketplace: false, syndication: false },
      ),
    ).toEqual({ marketplace: true, syndication: true });
  });

  it('reads feature map from subscription settings', () => {
    expect(
      resolveFeatureFlags(
        {
          features: { marketplace: true, syndication: false },
          isNetworkSubscription: false,
        },
        { marketplace: false, syndication: true },
      ),
    ).toEqual({ marketplace: true, syndication: false });
  });

  it('falls back to env when feature key missing', () => {
    expect(
      resolveFeatureFlags(
        { features: {}, isNetworkSubscription: false },
        { marketplace: true, syndication: false },
      ),
    ).toEqual({ marketplace: true, syndication: false });
  });
});

describe('getEnvFeatureFlags', () => {
  it('returns booleans from import.meta.env', () => {
    expect(getEnvFeatureFlags()).toEqual({
      marketplace: import.meta.env.VITE_MARKETPLACE === 'true',
      syndication: import.meta.env.VITE_SYNDICATION === 'true',
    });
  });
});
