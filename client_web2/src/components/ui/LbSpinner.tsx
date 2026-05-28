import { cn } from '@/lib/utils';

type LbSpinnerProps = {
  className?: string;
  /** light = white dots on orange button; dark = teal on page */
  tone?: 'light' | 'dark';
};

export function LbSpinner({ className, tone = 'light' }: LbSpinnerProps) {
  const dot = tone === 'light' ? 'bg-white/90' : 'bg-mar-teal';

  return (
    <span
      className={cn('inline-flex items-center justify-center gap-1.5', className)}
      aria-hidden="true"
    >
      <span className={cn('size-2 animate-bounce rounded-full', dot)} />
      <span
        className={cn('size-2 animate-bounce rounded-full [animation-delay:180ms]', dot)}
      />
    </span>
  );
}
