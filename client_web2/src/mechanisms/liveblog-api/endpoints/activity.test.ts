import { describe, expect, it } from 'vitest';
import {
  buildUserActivityWhere,
  countUnreadActivity,
  isActivityUnread,
  withActivityUnreadFlags,
} from './activity';
import type { ActivityNotification } from '../types';

describe('activity helpers', () => {
  it('filters non-admin users to content notifications only', () => {
    expect(buildUserActivityWhere('u1', 'user')).toEqual({
      'recipients.user_id': 'u1',
      user: { $exists: true },
    });
  });

  it('does not filter administrators', () => {
    expect(buildUserActivityWhere('u1', 'administrator')).toEqual({
      'recipients.user_id': 'u1',
    });
  });

  it('counts unread from recipients', () => {
    const items: ActivityNotification[] = [
      {
        _id: '1',
        name: 'liveblog:add',
        recipients: [{ user_id: 'u1', read: false }],
      },
      {
        _id: '2',
        name: 'notify',
        recipients: [{ user_id: 'u1', read: true }],
      },
    ];
    expect(countUnreadActivity(items, 'u1')).toBe(1);
    expect(withActivityUnreadFlags(items, 'u1')[0]._unread).toBe(true);
    expect(isActivityUnread([{ user_id: 'u1', read: true }], 'u1')).toBe(false);
  });
});
