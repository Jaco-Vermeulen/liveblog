import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbAlertVariant = 'error' | 'warning' | 'info';

type LbAlertProps = {
  children: ReactNode;
  variant?: LbAlertVariant;
  className?: string;
  role?: 'alert' | 'status';
};

const variants: Record<LbAlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-mar-border bg-mar-beige text-mar-text',
};

export function LbAlert({
  children,
  variant = 'error',
  className,
  role = 'alert',
}: LbAlertProps) {
  return (
    <p
      role={role}
      className={cn(
        'rounded-md border px-3.5 py-2.5 text-sm font-semibold',
        variants[variant],
        className,
      )}
    >
      {children}
    </p>
  );
}
