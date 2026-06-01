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
import { AF } from '@/copy';
import type { NavItem, SubNavItem } from './types';

export const NAV_BREAKPOINT_PX = 1024;

/** Show syndication, marketplace, advertising, freetypes in side nav (post-launch expansion). */
export function isExpansionNavEnabled(): boolean {
  return import.meta.env.VITE_SHOW_EXPANSION_NAV === 'true';
}

export const liveblogSubNav: SubNavItem[] = [
  { path: '/liveblog', label: AF.nav.allBlogs, end: true },
  { path: '/liveblog/active', label: AF.nav.active },
  { path: '/liveblog/archived', label: AF.nav.archived },
  { path: '/liveblog/deleted', label: AF.nav.deleted },
];

export const settingsSubNav: SubNavItem[] = [
  { path: '/settings/general', label: AF.nav.general, end: true },
  { path: '/settings/instance-settings', label: AF.nav.instanceSettings },
];

export const mainNavItems: NavItem[] = [
  {
    path: '/liveblog',
    label: AF.nav.liveblog,
    icon: BookOpen,
    section: 'main',
    end: false,
  },
];

export const adminNavItems: NavItem[] = [
  {
    path: '/users',
    label: AF.nav.users,
    icon: Users,
    section: 'admin',
    adminTools: true,
    privilege: 'users',
  },
  {
    path: '/settings/general',
    label: AF.nav.settings,
    icon: Settings,
    section: 'settings',
    adminTools: true,
    privilege: 'global_preferences',
  },
  {
    path: '/themes',
    label: AF.nav.themes,
    icon: Palette,
    section: 'admin',
    adminTools: true,
    privilege: 'global_preferences',
  },
  {
    path: '/freetypes',
    label: AF.nav.freetypes,
    icon: Puzzle,
    section: 'admin',
    adminTools: true,
    privilege: 'global_preferences',
    expansionPhase: true,
  },
  {
    path: '/advertising',
    label: AF.nav.advertising,
    icon: Megaphone,
    section: 'admin',
    adminTools: true,
    privilege: 'global_preferences',
    expansionPhase: true,
  },
  {
    path: '/marketplace',
    label: AF.nav.marketplace,
    icon: ShoppingBag,
    section: 'admin',
    adminTools: true,
    featureFlag: 'marketplace',
    expansionPhase: true,
  },
  {
    path: '/syndication',
    label: AF.nav.syndication,
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
  '/liveblog': AF.routes.liveblog,
  '/liveblog/active': AF.routes.activeBlogs,
  '/liveblog/archived': AF.routes.archivedBlogs,
  '/liveblog/deleted': AF.routes.deletedBlogs,
  '/settings': AF.routes.settings,
  '/settings/general': AF.routes.generalSettings,
  '/settings/instance-settings': AF.routes.instanceSettings,
  '/themes': AF.routes.themes,
  '/freetypes': AF.routes.freetypes,
  '/advertising': AF.routes.advertising,
  '/marketplace': AF.routes.marketplace,
  '/syndication': AF.routes.syndication,
  '/profile': AF.routes.profile,
  '/users': AF.routes.users,
};

export function getRouteTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith('/liveblog/edit/')) return AF.routes.editor;
  if (pathname.startsWith('/liveblog/settings/')) return AF.routes.blogSettings;
  if (pathname.startsWith('/liveblog/analytics/')) return AF.routes.analytics;
  return AF.routes.defaultTitle;
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
