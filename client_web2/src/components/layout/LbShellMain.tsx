import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { lbNavMainOffsetClass } from './nav-tokens';

type LbShellMainProps = {
  children: ReactNode;
  className?: string;
  subNav?: ReactNode;
};

/** Main content area — offset for top bar + side nav */
export function LbShellMain({ children, className, subNav }: LbShellMainProps) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col bg-mar-page pt-16',
        lbNavMainOffsetClass,
        className,
      )}
    >
      {subNav}
      <div className="lb-shell-outlet flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
