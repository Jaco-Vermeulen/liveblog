import { Link } from 'react-router-dom';
import type { ActivityNotification } from '@/mechanisms/liveblog-api';
import {
  formatActivityMessage,
  notificationLink,
} from '../services/notificationMessages';
import { useNotifications } from '../context/NotificationsProvider';
import { useEffect } from 'react';

type NotificationListItemProps = {
  notification: ActivityNotification;
  variant?: 'panel' | 'drawer';
  onNavigate?: () => void;
};

export function NotificationListItem({
  notification,
  variant = 'panel',
  onNavigate,
}: NotificationListItemProps) {
  const { scheduleMarkAsRead } = useNotifications();
  const isDrawer = variant === 'drawer';
  const handleNavigate = () => {
    onNavigate?.();
  };
  const href = notificationLink(notification);
  const message = formatActivityMessage(notification);
  const created = notification._created
    ? new Intl.DateTimeFormat('af-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(notification._created))
    : '';

  useEffect(() => {
    scheduleMarkAsRead(notification);
  }, [notification, scheduleMarkAsRead]);

  const content = (
    <>
      <time
        className={
          isDrawer ? 'block text-[10px] text-white/50' : 'block text-xs text-mar-muted'
        }
      >
        {created}
      </time>
      <p
        className={
          isDrawer
            ? 'm-0 mt-1 text-sm leading-snug text-white/90'
            : 'm-0 mt-1 text-sm text-mar-text'
        }
      >
        {message}
      </p>
    </>
  );

  return (
    <li
      className={
        isDrawer
          ? `border-b border-white/10 px-3 py-2.5 last:border-b-0 ${
              notification._unread ? 'bg-white/[0.08]' : ''
            }`
          : `border-b border-mar-border px-4 py-3 last:border-b-0 ${
              notification._unread ? 'bg-mar-beige/60' : ''
            }`
      }
    >
      {href ? (
        <Link
          to={href}
          className={
            isDrawer
              ? 'block no-underline hover:text-white'
              : 'block no-underline hover:text-mar-teal-dark'
          }
          onClick={handleNavigate}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
