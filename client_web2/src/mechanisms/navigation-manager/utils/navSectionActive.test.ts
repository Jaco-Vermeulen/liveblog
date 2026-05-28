import { describe, expect, it } from 'vitest';
import { liveblogSubNav, settingsSubNav } from '../nav-config';
import { isNavSectionActive } from './navSectionActive';

describe('isNavSectionActive', () => {
  it('detects liveblog list tabs', () => {
    expect(isNavSectionActive('/liveblog/active', '/liveblog', liveblogSubNav)).toBe(true);
    expect(isNavSectionActive('/themes', '/liveblog', liveblogSubNav)).toBe(false);
  });

  it('includes liveblog editor and blog settings under liveblog section', () => {
    expect(
      isNavSectionActive(
        '/liveblog/edit/507f1f77bcf86cd799439011',
        '/liveblog',
        liveblogSubNav,
      ),
    ).toBe(true);
    expect(
      isNavSectionActive(
        '/liveblog/settings/507f1f77bcf86cd799439011',
        '/liveblog',
        liveblogSubNav,
      ),
    ).toBe(true);
  });

  it('detects settings sub-routes', () => {
    expect(
      isNavSectionActive(
        '/settings/instance-settings',
        '/settings/general',
        settingsSubNav,
      ),
    ).toBe(true);
    expect(
      isNavSectionActive('/settings/general', '/settings/general', settingsSubNav),
    ).toBe(true);
  });
});
