import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LbInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  /** login = taller touch target for login form */
  inputSize?: 'default' | 'login';
};

export function LbInput({
  error,
  className,
  inputSize = 'default',
  ...props
}: LbInputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border-[1.5px] border-mar-border bg-mar-input text-mar-text',
        'placeholder:text-mar-meta transition-[border-color,box-shadow] duration-150',
        'focus:border-mar-teal focus:outline-none focus:ring-[3px] focus:ring-mar-teal/15',
        inputSize === 'login'
          ? 'min-h-[3rem] rounded-xl px-4 py-3 font-sans text-base shadow-[inset_0_1px_2px_rgba(28,25,23,0.04)] sm:min-h-[3.25rem]'
          : 'px-3 py-2.5 text-sm',
        error && 'border-mar-accent focus:border-mar-accent focus:ring-mar-accent/25',
        className,
      )}
      {...props}
    />
  );
}
