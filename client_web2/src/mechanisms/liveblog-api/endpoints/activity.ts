import { api } from '../client';
import type { ActivityNotification, ActivityRecipient, EveList, LiveblogUser } from '../types';

export function buildUserActivityWhere(
  userId: string,
  userType?: string,
): Record<string, unknown> {
  const where: Record<string, unknown> = { 'recipients.user_id': userId };
  if (userType === 'user') {
    where.user = { $exists: true };
  }
  return where;
}

export function countUnreadActivity(
  items: ActivityNotification[],
  userId: string,
): number {
  return items.filter((item) => isActivityUnread(item.recipients, userId)).length;
}

export function isActivityUnread(
  recipients: ActivityRecipient[],
  userId: string,
): boolean {
  const recipient = recipients.find((r) => r.user_id === userId);
  return Boolean(recipient && !recipient.read);
}

export function withActivityUnreadFlags(
  items: ActivityNotification[],
  userId: string,
): ActivityNotification[] {
  return items.map((item) => ({
    ...item,
    _unread: isActivityUnread(item.recipients ?? [], userId),
  }));
}

export function listUserActivity(
  userId: string,
  userType?: string,
  maxResults = 8,
): Promise<EveList<ActivityNotification>> {
  return api.get<EveList<ActivityNotification>>('/activity', {
    where: JSON.stringify(buildUserActivityWhere(userId, userType)),
    max_results: maxResults,
    embedded: JSON.stringify({ user: 1 }),
  });
}

export function markActivityRead(
  notification: ActivityNotification,
  userId: string,
): Promise<ActivityNotification> {
  const etag = notification._etag;
  if (!etag) {
    throw new Error('Activity notification missing _etag');
  }

  const recipients = (notification.recipients ?? []).map((recipient) =>
    recipient.user_id === userId ? { ...recipient, read: true } : recipient,
  );

  return api.patch<ActivityNotification>(
    `/activity/${encodeURIComponent(notification._id)}`,
    { recipients },
    { etag },
  );
}

/** Map Eve embedded user onto notification for display */
export function normalizeActivityItems(
  items: ActivityNotification[],
): ActivityNotification[] {
  return items.map((item) => {
    const raw = item as ActivityNotification & { user?: Partial<LiveblogUser> | string };
    if (raw.user && typeof raw.user === 'object') {
      return { ...item, embeddedUser: raw.user };
    }
    return item;
  });
}
