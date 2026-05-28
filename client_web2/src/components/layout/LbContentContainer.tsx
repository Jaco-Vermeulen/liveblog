import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbContentContainerProps = {
  children: ReactNode;
  className?: string;
  /** sm = 400px (login), md = 768px, lg = 1024px (default app), full = none */
  size?: 'sm' | 'md' | 'lg' | 'full';
  centered?: boolean;
};

const sizeClass: Record<NonNullable<LbContentContainerProps['size']>, string> = {
  sm: 'max-w-[440px]',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  full: 'max-w-none',
};

/** Centered content wrapper with consistent horizontal padding */
export function LbContentContainer({
  children,
  className,
  size = 'lg',
  centered = true,
}: LbContentContainerProps) {
  return (
    <div
      className={cn(
        'w-full px-6 py-10 max-md:px-5 max-md:py-8',
        centered && 'mx-auto flex flex-1 flex-col justify-center',
        sizeClass[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
