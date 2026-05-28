import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbBadgeVariant = 'teal' | 'orange' | 'muted';

type LbBadgeProps = {
  children: ReactNode;
  variant?: LbBadgeVariant;
  className?: string;
};

const variants: Record<LbBadgeVariant, string> = {
  teal: 'bg-mar-teal/15 text-mar-teal-dark',
  orange: 'bg-mar-orange/15 text-mar-orange-dark',
  muted: 'bg-mar-beige text-mar-muted',
};

export function LbBadge({ children, variant = 'teal', className }: LbBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
