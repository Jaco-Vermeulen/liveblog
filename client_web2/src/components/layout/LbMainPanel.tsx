import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbMainPanelProps = {
  children: ReactNode;
  className?: string;
};

/** Scrollable main column (login form side, page content) */
export function LbMainPanel({ children, className }: LbMainPanelProps) {
  return (
    <main
      className={cn(
        'flex flex-1 flex-col overflow-y-auto bg-mar-page',
        className,
      )}
    >
      {children}
    </main>
  );
}
