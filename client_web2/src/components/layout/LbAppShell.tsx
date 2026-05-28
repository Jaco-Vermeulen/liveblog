import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbAppShellProps = {
  topBar: ReactNode;
  sideNav: ReactNode;
  backdrop: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Composes top bar, side nav, backdrop, and main outlet */
export function LbAppShell({ topBar, sideNav, backdrop, children, className }: LbAppShellProps) {
  return (
    <div className={cn('flex h-dvh max-h-dvh flex-col overflow-hidden bg-mar-page', className)}>
      {backdrop}
      {sideNav}
      {topBar}
      {children}
    </div>
  );
}
