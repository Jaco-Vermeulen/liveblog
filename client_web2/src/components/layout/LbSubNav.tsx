import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

type LbSubNavProps = {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
};

/** Horizontal sub-navigation (tabs) below top bar */
export function LbSubNav({ children, className, 'aria-label': ariaLabel }: LbSubNavProps) {
  return (
    <nav
      aria-label={ariaLabel ?? 'Subnavigasie'}
      className={cn(
        'border-b border-mar-border bg-mar-panel',
        className,
      )}
    >
      <ul className="m-0 flex list-none flex-wrap gap-1 px-4 py-2 sm:px-6">{children}</ul>
    </nav>
  );
}

export type LbSubNavLinkProps = {
  to: string;
  children: ReactNode;
  end?: boolean;
};

export function LbSubNavLink({ to, children, end }: LbSubNavLinkProps) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(
            'inline-flex rounded-lg px-4 py-2 text-sm font-semibold no-underline transition-colors',
            isActive
              ? 'bg-mar-teal text-white'
              : 'text-mar-muted hover:bg-mar-beige hover:text-mar-text',
          )
        }
      >
        {children}
      </NavLink>
    </li>
  );
}
