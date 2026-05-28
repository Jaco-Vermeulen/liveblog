import { api } from '../client';
import type { AuthLoginBody, LiveblogUser, SessionData } from '../types';

export function login(credentials: AuthLoginBody): Promise<SessionData> {
  return api.post<SessionData>('/auth_db', credentials, { skipAuth: true });
}

export function getUser(userId: string): Promise<LiveblogUser> {
  return api.get<LiveblogUser>(`/users/${userId}`);
}

export function logoutSession(sessionHref: string): Promise<void> {
  const path = sessionHref.startsWith('http')
    ? new URL(sessionHref).pathname.replace(/^\/api/, '')
    : sessionHref.replace(/^\/api/, '');
  return api.delete(path.startsWith('/') ? path : `/${path}`);
}
