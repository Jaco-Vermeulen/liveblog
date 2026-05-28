import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LbSideNav,
  LbSideNavGroup,
  LbSideNavLink,
  LbSideNavMasthead,
} from '@/components/layout/LbSideNav';
import { getEnvFeatureFlags } from '@/lib/config/resolveFeatureFlags';
import { usePrivileges } from '@/mechanisms/auth-manager';
import { useInstanceFeatures } from '@/mechanisms/settings-manager';
import { afrikaanseDatum } from '../utils/afrikaanseDatum';
import {
  getVisibleAdminItems,
  liveblogSubNav,
  settingsSubNav,
} from '../nav-config';
import type { NavItem } from '../types';
import { useAppShell } from '../hooks/useAppShell';
import { NavDrawerUserBlock } from './NavDrawerUserBlock';
import { NavDrawerExpandableSection } from './NavDrawerExpandableSection';
import { NavDrawerNotificationsSection } from './NavDrawerNotificationsSection';

type NavMenuProps = {
  open: boolean;
};

const ADMIN_SUBTITLES: Partial<Record<string, string>> = {
  '/users': 'Gebruikers, rolle & toegang',
  '/settings/general': 'Algemeen & instansie',
  '/themes': 'Temas vir regstreekse blogs',
  '/freetypes': 'Pasgemaakte veldtipes',
  '/advertising': 'Advertensie-instellings',
  '/marketplace': 'Markplek-integrasie',
  '/syndication': 'Sindikasie na eksterne stelsels',
};

function renderAdminItem(item: NavItem, onNav: () => void) {
  if (item.path.startsWith('/settings')) {
    return (
      <NavDrawerExpandableSection
        key={item.path}
        sectionPath={item.path}
        label={item.label}
        subtitle={ADMIN_SUBTITLES[item.path]}
        icon={<item.icon className="h-[18px] w-[18px] text-white/90" strokeWidth={2} />}
        subItems={settingsSubNav}
        onNavigate={onNav}
      />
    );
  }

  return (
    <LbSideNavLink
      key={item.path}
      to={item.path}
      end={item.end}
      subtitle={ADMIN_SUBTITLES[item.path]}
      icon={<item.icon className="h-[18px] w-[18px] text-white/90" strokeWidth={2} />}
      onClick={onNav}
    >
      {item.label}
    </LbSideNavLink>
  );
}

export function NavMenu({ open }: NavMenuProps) {
  const { closeMobileNav } = useAppShell();
  const { flags, loading: featuresLoading } = useInstanceFeatures();
  const {
    canManageGlobalPreferences,
    canManageUsers,
    loading: privilegesLoading,
  } = usePrivileges();
  const adminItems = getVisibleAdminItems(
    featuresLoading ? getEnvFeatureFlags() : flags,
    {
      global_preferences: privilegesLoading ? false : canManageGlobalPreferences,
      users: privilegesLoading ? false : canManageUsers,
    },
  );

  const onNav = () => closeMobileNav();

  return (
    <LbSideNav
      open={open}
      onClose={closeMobileNav}
      masthead={
        <LbSideNavMasthead
          onClose={closeMobileNav}
          dateLine={afrikaanseDatum()}
          logo={
            <Link to="/liveblog" className="flex items-center" onClick={onNav}>
              <img
                src="/maroela-logo.svg"
                alt="Maroela Media"
                className="h-10 w-auto max-w-[14rem] brightness-0 invert sm:h-11"
              />
            </Link>
          }
        />
      }
      footer={
        <div className="space-y-1.5">
          <p className="m-0 text-sm font-bold text-white">Maroela Media</p>
          <p className="m-0 text-xs text-white/60">Regstreekse blog — admin</p>
        </div>
      }
    >
      <NavDrawerUserBlock />

      <LbSideNavGroup>
        <NavDrawerNotificationsSection onNavigate={onNav} />
      </LbSideNavGroup>

      <LbSideNavGroup title="Hoof">
        <NavDrawerExpandableSection
          sectionPath="/liveblog"
          label="Regstreekse blog"
          subtitle="Blogs, aktief, geargiveer & verwyder"
          icon={<BookOpen className="h-[18px] w-[18px] text-white/90" strokeWidth={2} />}
          subItems={liveblogSubNav}
          onNavigate={onNav}
        />
      </LbSideNavGroup>

      {adminItems.length > 0 ? (
        <LbSideNavGroup title="Admin">
          {adminItems.map((item) => renderAdminItem(item, onNav))}
        </LbSideNavGroup>
      ) : null}
    </LbSideNav>
  );
}
