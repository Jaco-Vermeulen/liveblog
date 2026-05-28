import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { LbSpinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useNotifications } from '../context/NotificationsProvider';
import { NotificationListItem } from './NotificationListItem';

type NavDrawerNotificationsSectionProps = {
  onNavigate?: () => void;
};

/** Kennisgewings in the teal drawer (replaces header bell + slide-out pane). */
export function NavDrawerNotificationsSection({
  onNavigate,
}: NavDrawerNotificationsSectionProps) {
  const { items, unread, loading, error } = useNotifications();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (unread > 0) setExpanded(true);
  }, [unread]);

  return (
    <li className="px-3 pb-2">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className={cn(
          'flex w-full items-center gap-3 rounded-[10px] border px-3.5 py-2.5 text-left transition-colors',
          'border-white/15 bg-white/10 text-white/92 hover:border-white/25 hover:bg-white/[0.16]',
          expanded && 'border-white/30 bg-black/20',
        )}
      >
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-white/20 bg-black/15">
          <Bell className="h-[18px] w-[18px] text-white/90" strokeWidth={2} aria-hidden />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mar-orange px-1 text-[0.6rem] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-snug">Kennisgewings</span>
          <span className="mt-0.5 block text-[11px] font-normal leading-snug text-white/55">
            {unread > 0 ? `${unread} ongelees` : 'Aktiwiteit op jou blogs'}
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="mt-2 overflow-hidden rounded-[10px] border border-white/15 bg-black/20">
          {loading && items === null ? (
            <div className="flex flex-col items-center py-8">
              <LbSpinner tone="light" />
              <p className="m-0 mt-2 text-xs text-white/60">Laai…</p>
            </div>
          ) : null}

          {error ? (
            <p className="m-0 px-3 py-4 text-sm text-mar-orange">{error}</p>
          ) : null}

          {!loading && !error && items?.length === 0 ? (
            <p className="m-0 px-3 py-4 text-sm text-white/60">
              Alles lyk goed tot dusver.
            </p>
          ) : null}

          {items && items.length > 0 ? (
            <ul className="m-0 max-h-56 list-none overflow-y-auto overscroll-contain p-0">
              {items.map((notification) => (
                <NotificationListItem
                  key={notification._id}
                  notification={notification}
                  variant="drawer"
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
