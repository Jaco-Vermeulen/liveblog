import type { LiveblogUser, SessionData } from '@/mechanisms/liveblog-api';

export type { LiveblogUser, SessionData };

export const SESSION_KEYS = {
  token: 'sess:token',
  user: 'sess:user',
  id: 'sess:id',
  href: 'sess:href',
} as const;

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LiveblogUser | null;
  token: string | null;
  sessionId: string | null;
  sessionHref: string | null;
}

export interface AuthContextValue {
  state: AuthState;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  refreshUser(): Promise<void>;
}

export type LoginErrorCode = '401' | '403' | '404' | 'network' | 'unknown';
