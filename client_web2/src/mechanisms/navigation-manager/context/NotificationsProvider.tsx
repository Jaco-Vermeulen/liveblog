import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  countUnreadActivity,
  listUserActivity,
  markActivityRead,
  normalizeActivityItems,
  withActivityUnreadFlags,
  type ActivityNotification,
} from '@/mechanisms/liveblog-api';
import { useAuth } from '@/mechanisms/auth-manager';
import { useWsServerEvent } from '@/mechanisms/websocket-manager';
import { isNotificationForUser } from '../services/notificationMessages';

const RELOAD_DELAY_MS = 500;
const MARK_READ_DELAY_MS = 1500;

export interface NotificationsContextValue {
  items: ActivityNotification[] | null;
  unread: number;
  loading: boolean;
  error: string | null;
  reload(): Promise<void>;
  markAsRead(notification: ActivityNotification): Promise<void>;
  scheduleMarkAsRead(notification: ActivityNotification): void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const userId = state.user?._id;
  const userType = state.user?.user_type;

  const [items, setItems] = useState<ActivityNotification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const reload = useCallback(async () => {
    if (!userId) {
      setItems(null);
      setUnread(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await listUserActivity(userId, userType);
      const normalized = withActivityUnreadFlags(
        normalizeActivityItems(response._items ?? []),
        userId,
      );
      setItems(normalized);
      setUnread(countUnreadActivity(normalized, userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon nie kennisgewings laai nie');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => {
      reloadTimer.current = null;
      void reload();
    }, RELOAD_DELAY_MS);
  }, [reload]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(
    () => () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      for (const timer of markTimers.current.values()) {
        clearTimeout(timer);
      }
      markTimers.current.clear();
    },
    [],
  );

  const handleWsExtras = useCallback(
    (extras: unknown) => {
      if (!userId || !isNotificationForUser(extras, userId)) return;
      scheduleReload();
    },
    [scheduleReload, userId],
  );

  useWsServerEvent('activity', handleWsExtras, Boolean(userId));
  useWsServerEvent('user:mention', handleWsExtras, Boolean(userId));

  const markAsRead = useCallback(
    async (notification: ActivityNotification) => {
      if (!userId || !notification._unread || !notification._etag) return;

      try {
        await markActivityRead(notification, userId);
        setItems((prev) => {
          if (!prev) return prev;
          return prev.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  _unread: false,
                  recipients: item.recipients.map((r) =>
                    r.user_id === userId ? { ...r, read: true } : r,
                  ),
                }
              : item,
          );
        });
        setUnread((count) => Math.max(0, count - 1));
      } catch (err) {
        console.warn('[navigation-manager] markAsRead failed', err);
      }
    },
    [userId],
  );

  const scheduleMarkAsRead = useCallback(
    (notification: ActivityNotification) => {
      if (!notification._unread) return;
      const existing = markTimers.current.get(notification._id);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        markTimers.current.delete(notification._id);
        void markAsRead(notification);
      }, MARK_READ_DELAY_MS);

      markTimers.current.set(notification._id, timer);
    },
    [markAsRead],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items,
      unread,
      loading,
      error,
      reload,
      markAsRead,
      scheduleMarkAsRead,
    }),
    [error, items, loading, markAsRead, reload, scheduleMarkAsRead, unread],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}
