import type { ActivityNotification } from '@/mechanisms/liveblog-api';

function slugline(notification: ActivityNotification): string {
  const fromData = notification.data?.item_slugline;
  if (typeof fromData === 'string' && fromData) return fromData;
  return notification.item_slugline ?? 'item';
}

export function formatActivityMessage(notification: ActivityNotification): string {
  const actor = notification.user_name ?? 'Stelsel';
  const title = slugline(notification);

  switch (notification.name) {
    case 'notify':
      return `${actor} het kommentaar gelewer op “${title}”.`;
    case 'user:mention':
      return `${actor} het jou genoem by “${title}”.`;
    case 'liveblog:request':
      return `${actor} vra toegang tot “${title}”.`;
    case 'liveblog:add':
      return `${actor} het jou by “${title}” gevoeg.`;
    default:
      return notification.message?.trim()
        ? `${actor}: ${notification.message}`
        : `${actor}: ${notification.name}`;
  }
}

export function notificationLink(notification: ActivityNotification): string | null {
  const blogId = notification.item;
  if (!blogId) return null;

  switch (notification.name) {
    case 'liveblog:request':
      return `/liveblog/settings/${blogId}?tab=team`;
    case 'liveblog:add':
      return `/liveblog/edit/${blogId}`;
    default:
      return null;
  }
}

export function isNotificationForUser(
  extras: unknown,
  userId: string,
): boolean {
  if (!extras || typeof extras !== 'object') return false;
  const dest = (extras as { _dest?: Array<{ user_id?: string }> })._dest ?? [];
  return dest.some((entry) => entry.user_id === userId);
}
