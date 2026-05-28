import { Link, Outlet, useLocation } from 'react-router-dom';
import { LbAppShell } from '@/components/layout/LbAppShell';
import { LbHamburger } from '@/components/layout/LbHamburger';
import { LbNavBackdrop } from '@/components/layout/LbNavBackdrop';
import { LbShellMain } from '@/components/layout/LbShellMain';
import { LbTopBar } from '@/components/layout/LbTopBar';
import { AppShellProvider } from '../context/AppShellProvider';
import { useAppShell } from '../hooks/useAppShell';
import { getRouteTitle } from '../nav-config';
import { NavMenu } from './NavMenu';
import { ConnectionBanner } from '@/mechanisms/websocket-manager';

function AppShellInner() {
  const { pathname } = useLocation();
  const { isMobileNavOpen, toggleMobileNav, closeMobileNav } = useAppShell();
  const title = getRouteTitle(pathname);

  return (
    <>
    <LbAppShell
      backdrop={
        <LbNavBackdrop visible={isMobileNavOpen} onClick={closeMobileNav} />
      }
      sideNav={<NavMenu open={isMobileNavOpen} />}
      topBar={
        <LbTopBar
          menuOpen={isMobileNavOpen}
          start={
            <>
              <Link
                to="/liveblog"
                className="inline-flex shrink-0 items-center lg:hidden"
                title="Maroela Media"
              >
                <img src="/maroela-logo.svg" alt="" className="h-8 w-auto" />
              </Link>
              <Link
                to="/liveblog"
                className="hidden items-center lg:flex"
                title="Maroela Media"
              >
                <img src="/maroela-logo.svg" alt="" className="h-8 w-auto" />
              </Link>
            </>
          }
          title={title}
          end={
            <LbHamburger
              open={isMobileNavOpen}
              onClick={toggleMobileNav}
              className="lg:hidden"
            />
          }
        />
      }
    >
      <LbShellMain>
        <ConnectionBanner />
        <Outlet />
      </LbShellMain>
    </LbAppShell>
    </>
  );
}

export function AppShell() {
  return (
    <AppShellProvider>
      <AppShellInner />
    </AppShellProvider>
  );
}
