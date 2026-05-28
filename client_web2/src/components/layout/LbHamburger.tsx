import { cn } from '@/lib/utils';

type LbHamburgerProps = {
  open: boolean;
  onClick: () => void;
  className?: string;
  label?: string;
};

/**
 * Legacy portal hamburger — markup + CSS match `client/app/styles/tailwind/portal.css`
 * (`.m-hamburger` / `#lb-top-menu.menu-open`). No Tailwind chrome on the button itself.
 */
export function LbHamburger({ open, onClick, className, label = 'Menu' }: LbHamburgerProps) {
  return (
    <button
      type="button"
      className={cn('collapse-nav m-hamburger', className)}
      onClick={onClick}
      aria-expanded={open}
      aria-controls="lb-main-menu"
      aria-label={label}
    >
      <span className="m-hamburger__box" aria-hidden="true">
        <span className="m-hamburger__bar" />
        <span className="m-hamburger__bar" />
        <span className="m-hamburger__bar" />
      </span>
    </button>
  );
}
