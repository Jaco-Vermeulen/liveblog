import type { LiveblogUser, SessionData } from '@/mechanisms/liveblog-api';
import { SESSION_KEYS, type AuthState } from '../types';

export function formatAuthHeader(token: string): string {
  return `Basic ${btoa(`${token}:`)}`;
}

export function reconcileStaleSession(): void {
  if (typeof localStorage === 'undefined') return;
  if (!localStorage.getItem(SESSION_KEYS.token) && localStorage.getItem(SESSION_KEYS.user)) {
    clearSession();
  }
}

export function readSession(): Pick<
  AuthState,
  'token' | 'user' | 'sessionId' | 'sessionHref'
> & { userId: string | null } {
  if (typeof localStorage === 'undefined') {
    return {
      token: null,
      user: null,
      sessionId: null,
      sessionHref: null,
      userId: null,
    };
  }

  const token = localStorage.getItem(SESSION_KEYS.token);
  const userId = localStorage.getItem(SESSION_KEYS.user);
  const sessionId = localStorage.getItem(SESSION_KEYS.id);
  const sessionHref = localStorage.getItem(SESSION_KEYS.href);

  return {
    token,
    user: null,
    sessionId,
    sessionHref,
    userId,
  };
}

export function writeSession(session: SessionData, user: LiveblogUser): void {
  const authHeader = formatAuthHeader(session.token);
  localStorage.setItem(SESSION_KEYS.token, authHeader);
  localStorage.setItem(SESSION_KEYS.user, user._id);
  localStorage.setItem(SESSION_KEYS.id, session._id);
  localStorage.setItem(SESSION_KEYS.href, session._links?.self?.href ?? '');
}

export function clearSession(): void {
  for (const key of Object.values(SESSION_KEYS)) {
    localStorage.removeItem(key);
  }
}
