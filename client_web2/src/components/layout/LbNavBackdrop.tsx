import { cn } from '@/lib/utils';

type LbNavBackdropProps = {
  visible: boolean;
  onClick: () => void;
};

export function LbNavBackdrop({ visible, onClick }: LbNavBackdropProps) {
  return (
    <button
      type="button"
      aria-label="Sluit navigasie"
      className={cn(
        'fixed inset-0 z-40 bg-mar-text/45 transition-opacity duration-300 lg:hidden',
        visible ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none',
      )}
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
    />
  );
}
