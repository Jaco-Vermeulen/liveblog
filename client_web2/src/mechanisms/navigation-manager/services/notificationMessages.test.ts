import { describe, expect, it } from 'vitest';
import {
  formatActivityMessage,
  isNotificationForUser,
  notificationLink,
} from './notificationMessages';
import type { ActivityNotification } from '@/mechanisms/liveblog-api';

describe('notificationMessages', () => {
  it('formats liveblog:add', () => {
    const n: ActivityNotification = {
      _id: '1',
      name: 'liveblog:add',
      user_name: 'Jane',
      item: 'blog1',
      data: { item_slugline: 'Sport blog' },
      recipients: [],
    };
    expect(formatActivityMessage(n)).toContain('Jane');
    expect(formatActivityMessage(n)).toContain('Sport blog');
    expect(notificationLink(n)).toBe('/liveblog/edit/blog1');
  });

  it('detects current user in ws extras', () => {
    expect(
      isNotificationForUser({ _dest: [{ user_id: 'u1' }] }, 'u1'),
    ).toBe(true);
    expect(isNotificationForUser({ _dest: [{ user_id: 'u2' }] }, 'u1')).toBe(false);
  });
});
