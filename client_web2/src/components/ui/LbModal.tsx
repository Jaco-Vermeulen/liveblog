import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LbButton } from './LbButton';

type LbModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** Accessible modal dialog — style-guide primitive */
export function LbModal({ open, onClose, title, children, footer, className }: LbModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-mar-text/40"
        aria-label="Sluit"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lb-modal-title"
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl border border-mar-border bg-mar-card shadow-xl',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-mar-border px-6 py-4">
          <h2 id="lb-modal-title" className="text-lg font-bold text-mar-text">
            {title}
          </h2>
          <LbButton type="button" variant="ghost" onClick={onClose} aria-label="Sluit">
            ×
          </LbButton>
        </div>
        <div className="px-6 py-4 text-mar-text">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-mar-border px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
