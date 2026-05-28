import { describe, expect, it } from 'vitest';
import { getRouteTitle, getSubNavForPath, getVisibleAdminItems } from './nav-config';

describe('nav-config', () => {
  it('resolves route titles', () => {
    expect(getRouteTitle('/liveblog')).toBe('Regstreekse blog');
    expect(getRouteTitle('/themes')).toBe('Temabestuur');
  });

  it('returns sub-nav for liveblog and settings', () => {
    expect(getSubNavForPath('/liveblog/active')?.length).toBe(4);
    expect(getSubNavForPath('/settings/general')?.length).toBe(2);
    expect(getSubNavForPath('/themes')).toBeNull();
  });

  it('hides sub-nav on editor and blog settings routes', () => {
    expect(getSubNavForPath('/liveblog/edit/507f1f77bcf86cd799439011')).toBeNull();
    expect(getSubNavForPath('/liveblog/settings/507f1f77bcf86cd799439011')).toBeNull();
  });

  it('filters feature-flag admin items when expansion nav is enabled', () => {
    const none = getVisibleAdminItems({ marketplace: false, syndication: false });
    expect(none.some((i) => i.path === '/marketplace')).toBe(false);
  });

  it('hides post-launch expansion admin nav by default', () => {
    const launch = getVisibleAdminItems(
      { marketplace: true, syndication: true },
      { global_preferences: true },
    );
    expect(launch.map((i) => i.path)).toEqual(['/settings/general', '/themes']);
    expect(launch.some((i) => i.path === '/syndication')).toBe(false);
    expect(launch.some((i) => i.path === '/freetypes')).toBe(false);
  });

  it('hides global_preferences admin items without privilege', () => {
    const without = getVisibleAdminItems(
      { marketplace: false, syndication: false },
      { global_preferences: false, users: true },
    );
    expect(without.some((i) => i.path === '/themes')).toBe(false);
    expect(without.some((i) => i.path === '/users')).toBe(true);
    const withPref = getVisibleAdminItems(
      { marketplace: false, syndication: false },
      { global_preferences: true, users: true },
    );
    expect(withPref.some((i) => i.path === '/themes')).toBe(true);
  });

  it('hides users admin item without users privilege', () => {
    const without = getVisibleAdminItems(
      { marketplace: false, syndication: false },
      { global_preferences: true, users: false },
    );
    expect(without.some((i) => i.path === '/users')).toBe(false);
  });
});
