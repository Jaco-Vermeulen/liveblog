import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { SubNavItem } from '../types';
import { isNavSectionActive } from '../utils/navSectionActive';

type NavDrawerExpandableSectionProps = {
  sectionPath: string;
  label: string;
  subtitle?: string;
  icon?: ReactNode;
  subItems: SubNavItem[];
  onNavigate?: () => void;
};

/**
 * Parent row matches LbSideNavLink; sub-tabs show indented when this section is active.
 * No separate expand chevron — collapsed by default, opens when the route is in-section.
 */
export function NavDrawerExpandableSection({
  sectionPath,
  label,
  subtitle,
  icon,
  subItems,
  onNavigate,
}: NavDrawerExpandableSectionProps) {
  const { pathname } = useLocation();
  const expanded = isNavSectionActive(pathname, sectionPath, subItems);

  return (
    <li className="px-3 pb-1">
      <NavLink
        to={sectionPath}
        end={sectionPath === '/liveblog' ? false : undefined}
        onClick={onNavigate}
        className={({ isActive: parentActive }) =>
          cn(
            'group flex items-center gap-3 rounded-[10px] border px-3.5 py-2.5 no-underline transition-colors',
            'border-white/15 bg-white/10 text-white/92',
            'hover:border-white/25 hover:bg-white/[0.16]',
            parentActive &&
              'border-white/30 bg-black/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
          )
        }
      >
        {({ isActive: parentActive }) => (
          <>
            {icon ? (
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-white/20 bg-black/15',
                  parentActive && 'border-white/30 bg-black/25',
                )}
              >
                {icon}
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-snug">{label}</span>
              {subtitle ? (
                <span className="mt-0.5 block text-[11px] font-normal leading-snug text-white/55">
                  {subtitle}
                </span>
              ) : null}
            </span>
          </>
        )}
      </NavLink>

      {expanded ? (
        <ul className="m-0 mt-1 list-none space-y-0.5 border-l-2 border-white/25 py-0.5 pl-3 ml-[1.125rem] mr-0">
          {subItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive: subActive }) =>
                  cn(
                    'block rounded-[8px] px-2.5 py-2 text-sm font-medium no-underline transition-colors',
                    subActive
                      ? 'bg-black/25 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
