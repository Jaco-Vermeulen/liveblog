import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LbHeaderWatermark } from './LbHeaderWatermark';
import { lbNavTopBarOffsetClass } from './nav-tokens';

type LbTopBarProps = {
  start?: ReactNode;
  title?: ReactNode;
  end?: ReactNode;
  /** When true, animates hamburger bars (legacy `#top-menu.menu-open`). */
  menuOpen?: boolean;
  className?: string;
};

/** Fixed top bar — 4rem height, muurpapier tiling, offset for side nav on lg+ */
export function LbTopBar({ start, title, end, menuOpen, className }: LbTopBarProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeightPx, setHeaderHeightPx] = useState(0);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const update = () => {
      const h = node.getBoundingClientRect().height || node.clientHeight;
      if (h > 0) setHeaderHeightPx(h);
    };

    update();
    window.addEventListener('resize', update);
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(node);
    }
    return () => {
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      id="lb-top-menu"
      className={cn(
        'fixed left-0 right-0 top-0 z-30 isolate',
        'flex h-16 items-center justify-between gap-3',
        'border-b border-mar-border bg-white px-2 shadow-[0_1px_0_rgba(21,117,120,0.12)]',
        lbNavTopBarOffsetClass,
        menuOpen && 'menu-open',
        className,
      )}
    >
      <LbHeaderWatermark headerHeightPx={headerHeightPx} />

      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
        {start}
        {title ? (
          <h1 className="m-0 truncate font-sans text-xl font-bold tracking-tight text-mar-teal-dark">
            {title}
          </h1>
        ) : null}
      </div>

      {end ? (
        <div className="relative z-10 flex shrink-0 items-center gap-2">{end}</div>
      ) : null}
    </header>
  );
}
