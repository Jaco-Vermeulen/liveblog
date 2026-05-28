import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SESSION_KEYS } from '../types';
import {
  clearSession,
  formatAuthHeader,
  readSession,
  reconcileStaleSession,
  writeSession,
} from './sessionStorage';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sessionStorage', () => {
  it('formats Basic auth header like Superdesk', () => {
    expect(formatAuthHeader('abc123')).toBe(`Basic ${btoa('abc123:')}`);
  });

  it('writes all sess:* keys', () => {
    writeSession(
      {
        _id: 'sess1',
        token: 'tok',
        user: 'user1',
        _links: { self: { href: '/auth/sess1' } },
      },
      { _id: 'user1', username: 'admin' },
    );

    expect(storage.get(SESSION_KEYS.token)).toBe(formatAuthHeader('tok'));
    expect(storage.get(SESSION_KEYS.user)).toBe('user1');
    expect(storage.get(SESSION_KEYS.id)).toBe('sess1');
    expect(storage.get(SESSION_KEYS.href)).toBe('/auth/sess1');
  });

  it('clears stale session when token missing but user present', () => {
    storage.set(SESSION_KEYS.user, 'user1');
    storage.set(SESSION_KEYS.id, 'sess1');
    reconcileStaleSession();
    expect(storage.has(SESSION_KEYS.user)).toBe(false);
    expect(storage.has(SESSION_KEYS.id)).toBe(false);
  });

  it('reads session ids from storage', () => {
    storage.set(SESSION_KEYS.token, 'Basic x');
    storage.set(SESSION_KEYS.user, 'user1');
    const read = readSession();
    expect(read.token).toBe('Basic x');
    expect(read.userId).toBe('user1');
    clearSession();
    expect(readSession().token).toBeNull();
  });
});
