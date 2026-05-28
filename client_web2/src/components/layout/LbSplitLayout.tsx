import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbSplitLayoutProps = {
  brand: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Two-column split: brand aside (~42%) + main panel */
export function LbSplitLayout({ brand, children, className }: LbSplitLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen min-h-dvh w-full flex-row max-md:flex-col',
        className,
      )}
    >
      {brand}
      {children}
    </div>
  );
}
