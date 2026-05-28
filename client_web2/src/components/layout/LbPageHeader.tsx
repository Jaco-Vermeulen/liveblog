import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbPageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** login = larger welcome heading */
  variant?: 'default' | 'login';
};

export function LbPageHeader({
  title,
  subtitle,
  actions,
  className,
  variant = 'default',
}: LbPageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 flex flex-wrap items-start justify-between gap-4',
        variant === 'login' && 'mb-6 block',
        className,
      )}
    >
      <div>
        <h2
          className={cn(
            'font-bold tracking-tight text-mar-text',
            variant === 'login'
              ? 'm-0 mb-1.5 text-[1.75rem] sm:text-[2rem]'
              : 'text-2xl font-black sm:text-3xl',
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={cn(
              'text-mar-muted',
              variant === 'login' ? 'm-0 text-[0.9375rem] sm:text-lg' : 'mt-1 text-sm sm:text-base',
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
