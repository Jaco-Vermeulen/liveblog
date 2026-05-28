import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbAppHeaderProps = {
  logo?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

/** Top application bar (setup page, future nav shell) */
export function LbAppHeader({ logo, title, meta, trailing, className }: LbAppHeaderProps) {
  return (
    <header
      className={cn(
        'border-b border-mar-border bg-mar-panel',
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {logo}
          <div className="min-w-0">{title}</div>
          {meta}
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-3">{trailing}</div> : null}
      </div>
    </header>
  );
}
