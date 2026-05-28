import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LbButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';

type LbButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: LbButtonVariant;
  children: ReactNode;
};

const variants: Record<LbButtonVariant, string> = {
  primary:
    'bg-mar-teal text-white hover:bg-mar-teal-dark focus-visible:ring-mar-teal/40',
  secondary:
    'border border-mar-border bg-mar-card text-mar-text hover:bg-mar-beige focus-visible:ring-mar-teal/30',
  ghost: 'text-mar-teal hover:bg-mar-teal/10 focus-visible:ring-mar-teal/30',
  accent:
    'border border-mar-orange-dark bg-mar-orange text-white shadow-[0_4px_14px_rgba(196,87,18,0.28)] hover:bg-mar-orange-dark hover:shadow-[0_8px_22px_rgba(196,87,18,0.38)] active:scale-[0.99] focus-visible:ring-mar-orange/40',
};

export function LbButton({
  variant = 'primary',
  className,
  children,
  type = 'button',
  ...props
}: LbButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-65',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
