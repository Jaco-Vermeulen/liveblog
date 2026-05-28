import type { FormHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type LbAuthCardProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Show Maroela mark above title (mobile / form panel) */
  showLogo?: boolean;
};

/**
 * Login / auth card — UX-polished surface (no header/body divider).
 * Use for sign-in, password reset, etc.
 */
export function LbAuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  showLogo = false,
}: LbAuthCardProps) {
  return (
    <article
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-mar-border/90 bg-mar-card',
        'shadow-[0_2px_8px_rgba(28,25,23,0.04),0_16px_48px_rgba(28,25,23,0.1)]',
        className,
      )}
    >
      <div className="h-1 bg-mar-teal" aria-hidden="true" />

      <div className="px-8 pt-9 sm:px-10 sm:pt-10">
        {showLogo ? (
          <img
            src="/maroela-logo.svg"
            alt="Maroela Media"
            className="mb-6 h-8 w-auto lg:hidden"
          />
        ) : null}

        {eyebrow ? (
          <p className="mb-3 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-mar-teal">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="font-sans text-[1.875rem] font-black leading-[1.12] tracking-tight text-mar-text sm:text-[2.25rem]">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-3 max-w-sm font-sans text-base leading-relaxed text-mar-muted">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="space-y-6 px-8 pb-9 pt-8 sm:px-10 sm:pb-10">{children}</div>
    </article>
  );
}

export function LbAuthForm({
  children,
  className,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={cn('flex flex-col gap-6', className)} {...props}>
      {children}
    </form>
  );
}
