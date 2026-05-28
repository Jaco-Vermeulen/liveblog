import type { LucideIcon } from 'lucide-react';

export type NavSection = 'main' | 'admin' | 'settings';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  section: NavSection;
  adminTools?: boolean;
  end?: boolean;
  featureFlag?: 'marketplace' | 'syndication';
  /** Superdesk privilege required to show nav link (legacy adminTools). */
  privilege?: 'global_preferences' | 'users';
  /** Post-launch expansion — hidden from nav until `VITE_SHOW_EXPANSION_NAV=true`. */
  expansionPhase?: boolean;
}

export interface SubNavItem {
  path: string;
  label: string;
  end?: boolean;
}

export interface AppShellContextValue {
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}
