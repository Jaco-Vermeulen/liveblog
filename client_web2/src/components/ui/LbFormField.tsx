import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbFormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
  /** login = uppercase muted label (Maroela login form) */
  variant?: 'default' | 'login';
};

export function LbFormField({
  label,
  htmlFor,
  children,
  className,
  variant = 'default',
}: LbFormFieldProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        variant === 'login' ? 'gap-2' : 'mb-5 gap-1.5',
        className,
      )}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          'font-sans',
          variant === 'login'
            ? 'text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-mar-muted'
            : 'text-sm font-semibold text-mar-text',
        )}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
