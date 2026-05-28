import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppShellContextValue } from '../types';

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);
  const toggleMobileNav = useCallback(() => setIsMobileNavOpen((v) => !v), []);

  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [isMobileNavOpen]);

  const value = useMemo<AppShellContextValue>(
    () => ({
      isMobileNavOpen,
      openMobileNav,
      closeMobileNav,
      toggleMobileNav,
    }),
    [isMobileNavOpen, openMobileNav, closeMobileNav, toggleMobileNav],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}
