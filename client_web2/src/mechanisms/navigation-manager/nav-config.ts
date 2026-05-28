import {
  BookOpen,
  LayoutGrid,
  Megaphone,
  Palette,
  Puzzle,
  Radio,
  Settings,
  ShoppingBag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { NavItem, SubNavItem } from './types';

export const NAV_BREAKPOINT_PX = 1024;

/** Show syndication, marketplace, advertising, freetypes in side nav (post-launch expansion). */
export function isExpansionNavEnabled(): boolean {
  return import.meta.env.VITE_SHOW_EXPANSION_NAV === 'true';
}

export const liveblogSubNav: SubNavItem[] = [
  { path: '/liveblog', label: 'Alle blogs', end: true },
  { path: '/liveblog/active', label: 'Aktief' },
  { path: '/liveblog/archived', label: 'Geargiveer' },
  { path: '/liveblog/deleted', label: 'Verwyder' },
];

export const settingsSubNav: SubNavItem[] = [
  { path: '/settings/general', label: 'Algemeen', end: true },
  { path: '/settings/instance-settings', label: 'Instansie-instellings' },
];

export const mainNavItems: NavItem[] = [
  {
    path: '/liveblog',
    label: 'Regstreekse blog',
    icon: BookOpen,
    section: 'main',
    end: false,
  },
];

export const adminNavItems: NavItem[] = [
  {
    path: '/users',
    label: 'Gebruikersbestuur',
    icon: Users,
    section: 'admin',
    adminTools: true,
    privilege: 'users',
  },
  {
    path: '/settings/general',
    label: 'Liveblog-instellings',
    icon: Settings,
    section: 'settings',
    adminTools: true,
    privilege: 'global_preferences',
  },
  {
    path: '/themes',
    label: 'Temabestuur',
    icon: Palette,
    section: 'admin',
    adminTools: true,
    privilege: 'global_preferences',
  },
  {
    path: '/freetypes',
    label: 'Free types',
    icon: Puzzle,
    section: 'admin',
    adminTools: true,
    privilege: 'global_preferences',
    expansionPhase: true,
  },
  {
    path: '/advertising',
    label: 'Advertising',
    icon: Megaphone,
    section: 'admin',
    adminTools: true,
    privilege: 'global_preferences',
    expansionPhase: true,
  },
  {
    path: '/marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    section: 'admin',
    adminTools: true,
    featureFlag: 'marketplace',
    expansionPhase: true,
  },
  {
    path: '/syndication',
    label: 'Syndication',
    icon: Radio,
    section: 'admin',
    adminTools: true,
    featureFlag: 'syndication',
    expansionPhase: true,
  },
];

export function getVisibleAdminItems(
  flags?: {
    marketplace?: boolean;
    syndication?: boolean;
  },
  privileges?: {
    global_preferences?: boolean;
    users?: boolean;
  },
): NavItem[] {
  const showExpansion = isExpansionNavEnabled();
  return adminNavItems.filter((item) => {
    if (item.expansionPhase && !showExpansion) return false;
    if (item.featureFlag === 'marketplace' && !flags?.marketplace) return false;
    if (item.featureFlag === 'syndication' && !flags?.syndication) return false;
    if (item.privilege === 'global_preferences' && !privileges?.global_preferences) {
      return false;
    }
    if (item.privilege === 'users' && !privileges?.users) {
      return false;
    }
    return true;
  });
}

const routeTitles: Record<string, string> = {
  '/liveblog': 'Regstreekse blog',
  '/liveblog/active': 'Aktiewe blogs',
  '/liveblog/archived': 'Geargiveerde blogs',
  '/liveblog/deleted': 'Verwyderde blogs',
  '/settings': 'Instellings',
  '/settings/general': 'Algemene instellings',
  '/settings/instance-settings': 'Instansie-instellings',
  '/themes': 'Temabestuur',
  '/freetypes': 'Free types',
  '/advertising': 'Advertising',
  '/marketplace': 'Marketplace',
  '/syndication': 'Syndication',
  '/profile': 'Profiel',
  '/users': 'Gebruikersbestuur',
};

export function getRouteTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith('/liveblog/edit/')) return 'Blog-redigeerder';
  if (pathname.startsWith('/liveblog/settings/')) return 'Blog-instellings';
  if (pathname.startsWith('/liveblog/analytics/')) return 'Blog-analise';
  return 'Liveblog Admin';
}

export function getSubNavForPath(pathname: string): SubNavItem[] | null {
  if (
    pathname.startsWith('/liveblog/edit/') ||
    pathname.startsWith('/liveblog/settings/')
  ) {
    return null;
  }
  if (pathname.startsWith('/liveblog')) return liveblogSubNav;
  if (pathname.startsWith('/settings')) return settingsSubNav;
  return null;
}

export function getNavIcon(item: NavItem): LucideIcon {
  return item.icon ?? LayoutGrid;
}
