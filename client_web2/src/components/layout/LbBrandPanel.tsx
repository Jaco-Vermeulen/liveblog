import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LbBrandPanelProps = {
  children: ReactNode;
  className?: string;
};

/** Maroela teal brand column (login left panel) */
export function LbBrandPanel({ children, className }: LbBrandPanelProps) {
  return (
    <aside
      className={cn(
        'flex w-[42%] shrink-0 items-center justify-center overflow-hidden bg-mar-teal',
        'px-10 py-12 max-md:w-full max-md:min-h-[220px] max-md:px-6 max-md:py-8',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-4 text-center">
        {children}
      </div>
    </aside>
  );
}

export function LbBrandLogo() {
  return (
    <img
      src="/maroela-logo.svg"
      alt=""
      width={72}
      height={72}
      className="mb-2 h-[72px] w-[72px] object-contain opacity-95 brightness-0 invert"
    />
  );
}

export function LbBrandTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="m-0 text-[2rem] font-black leading-tight tracking-tight text-white sm:text-[2.5rem]">
      {children}
    </h1>
  );
}

export function LbBrandTagline({ children }: { children: ReactNode }) {
  return <p className="m-0 text-[0.9375rem] leading-normal text-white/80">{children}</p>;
}

export function LbBrandOrnament() {
  return (
    <div className="my-2 flex gap-2" aria-hidden="true">
      <span className="h-[3px] w-8 rounded-full bg-white/60" />
      <span className="h-[3px] w-4 rounded-full bg-mar-accent" />
      <span className="h-[3px] w-2 rounded-full bg-white/60" />
    </div>
  );
}

export function LbBrandCopy({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 max-w-[240px] text-[0.8125rem] leading-snug text-white/60">{children}</p>
  );
}
