import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { lbNavPanelWidthClass } from './nav-tokens';

export { LB_NAV_WIDTH } from './nav-tokens';
export const LB_TOPBAR_HEIGHT = '4rem';

/** Teal gradient + inset 3D (shared). */
const LB_DRAWER_GRADIENT = 'bg-gradient-to-b from-mar-teal to-mar-teal-dark';

/** Left-docked 3D (desktop): highlight on left edge, depth toward content on the right. */
const LB_DRAWER_SHADOW_LEFT =
  'shadow-[inset_0_2px_0_rgba(255,255,255,0.42),inset_0_-5px_14px_rgba(0,0,0,0.22),inset_4px_0_14px_rgba(255,255,255,0.1),inset_-4px_0_14px_rgba(0,0,0,0.16),4px_0_32px_rgba(13,79,82,0.28)]';

/** Desktop left-docked panel (unchanged). */
export const LB_DRAWER_PANEL_3D = `${LB_DRAWER_GRADIENT} ${LB_DRAWER_SHADOW_LEFT}`;

type LbSideNavProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
  masthead?: ReactNode;
  footer?: ReactNode;
};

/**
 * Teal nav panel.
 * Mobile: right-docked, slides from right, full 3D (inset + drop shadow toward content).
 * Desktop (lg+): left-docked persistent nav — unchanged.
 */
export function LbSideNav({
  children,
  open,
  onClose,
  className,
  masthead,
  footer,
}: LbSideNavProps) {
  return (
    <nav
      id="lb-main-menu"
      aria-label="Hoofnavigasie"
      className={cn(
        'fixed bottom-0 top-0 z-50 flex flex-col',
        lbNavPanelWidthClass,
        LB_DRAWER_GRADIENT,
        /* Mobile right-dock: mirrored horizontal inset 3D */
        'max-lg:shadow-[inset_0_2px_0_rgba(255,255,255,0.42),inset_0_-5px_14px_rgba(0,0,0,0.22),inset_-4px_0_14px_rgba(255,255,255,0.12),inset_4px_0_14px_rgba(0,0,0,0.16),-4px_0_32px_rgba(13,79,82,0.28)]',
        /* Desktop left-dock: unchanged */
        'lg:shadow-[inset_0_2px_0_rgba(255,255,255,0.42),inset_0_-5px_14px_rgba(0,0,0,0.22),inset_4px_0_14px_rgba(255,255,255,0.1),inset_-4px_0_14px_rgba(0,0,0,0.16),4px_0_32px_rgba(13,79,82,0.28)]',
        'right-0 max-lg:rounded-tl-[10px] max-lg:rounded-bl-[10px]',
        'lg:left-0 lg:right-auto lg:rounded-none',
        'transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        className,
      )}
    >
      <div className="relative shrink-0 border-b border-white/20">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent"
          aria-hidden
        />
        {masthead ?? (
          <div className="relative flex min-h-16 items-center justify-end px-4 py-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white hover:bg-black/35 lg:hidden"
              onClick={onClose}
              aria-label="Sluit menu"
            >
              <LbCloseIcon />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain py-2">{children}</div>

      {footer ? (
        <div className="shrink-0 border-t border-white/20 px-4 py-4 text-center">{footer}</div>
      ) : null}
    </nav>
  );
}

export function LbSideNavMasthead({
  logo,
  dateLine,
  onClose,
  className,
}: {
  logo: ReactNode;
  dateLine?: string;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className={cn('relative px-4 pb-3 pt-4 text-white', className)}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <div className="min-w-0" aria-hidden />
        <div className="flex min-w-0 justify-center">{logo}</div>
        <div className="flex min-w-0 justify-end">
          <button
            type="button"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/20 hover:bg-black/35 lg:hidden"
            onClick={onClose}
            aria-label="Sluit menu"
          >
            <LbCloseIcon />
          </button>
        </div>
      </div>
      {dateLine ? (
        <p className="m-0 mt-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85">
          {dateLine}
        </p>
      ) : null}
    </div>
  );
}

function LbCloseIcon() {
  return (
    <svg
      viewBox="0 0 10 10"
      className="h-2.5 w-2.5 stroke-current"
      fill="none"
      strokeWidth={1.7}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M1 1l8 8M9 1L1 9" />
    </svg>
  );
}

export function LbSideNavGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-2 px-1">
      {title ? (
        <p className="m-0 px-4 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">
          {title}
        </p>
      ) : null}
      <ul className="m-0 list-none p-0">{children}</ul>
    </div>
  );
}

export type LbSideNavLinkProps = {
  to: string;
  children: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  onClick?: () => void;
  end?: boolean;
};

export function LbSideNavLink({
  to,
  children,
  subtitle,
  icon,
  onClick,
  end,
}: LbSideNavLinkProps) {
  return (
    <li className="px-3">
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            'group flex items-center gap-3 rounded-[10px] border px-3.5 py-2.5 no-underline transition-colors',
            'border-white/15 bg-white/10 text-white/92',
            'hover:border-white/25 hover:bg-white/[0.16]',
            isActive &&
              'border-white/30 bg-black/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
          )
        }
      >
        {({ isActive }) => (
          <>
            {icon ? (
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-white/20 bg-black/15',
                  isActive && 'border-white/30 bg-black/25',
                )}
              >
                {icon}
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-snug">{children}</span>
              {subtitle ? (
                <span className="mt-0.5 block text-[11px] font-normal leading-snug text-white/55">
                  {subtitle}
                </span>
              ) : null}
            </span>
            <svg
              viewBox="0 0 10 10"
              className="h-2.5 w-2.5 shrink-0 stroke-white/40 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
              fill="none"
              strokeWidth={1.8}
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M2 1l4 4-4 4" className="stroke-current" />
            </svg>
          </>
        )}
      </NavLink>
    </li>
  );
}
