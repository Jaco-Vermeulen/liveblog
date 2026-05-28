import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbFullscreenShellProps = {
  children: ReactNode;
  className?: string;
};

/** Fixed viewport shell for login and full-page flows */
export function LbFullscreenShell({ children, className }: LbFullscreenShellProps) {
  return (
    <div className={cn('fixed inset-0 z-50 flex overflow-hidden bg-mar-page', className)}>
      {children}
    </div>
  );
}
