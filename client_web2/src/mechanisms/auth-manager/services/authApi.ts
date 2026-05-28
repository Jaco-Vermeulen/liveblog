import { getUser, login as apiLogin, logoutSession } from '@/mechanisms/liveblog-api';
import type { LiveblogUser, SessionData } from '@/mechanisms/liveblog-api';
import { formatAuthHeader, writeSession } from './sessionStorage';
import { SESSION_KEYS } from '../types';

export async function login(
  username: string,
  password: string,
): Promise<{ session: SessionData; user: LiveblogUser }> {
  const session = await apiLogin({ username, password });
  // Set token before profile fetch so liveblog-api sends Authorization
  localStorage.setItem(SESSION_KEYS.token, formatAuthHeader(session.token));
  const user = await getUser(session.user);
  writeSession(session, user);
  return { session, user };
}

export async function logout(sessionHref: string | null): Promise<void> {
  if (sessionHref) {
    try {
      await logoutSession(sessionHref);
    } catch {
      // Clear local session even when server logout fails (legacy parity)
    }
  }
}

export { getUser };
