import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { LiveblogApiError, setOnUnauthorized } from '@/mechanisms/liveblog-api';
import * as authApi from '../services/authApi';
import {
  clearSession,
  readSession,
  reconcileStaleSession,
} from '../services/sessionStorage';
import type { AuthContextValue, AuthState } from '../types';

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  sessionId: null,
  sessionHref: null,
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const applyLoggedOut = useCallback(() => {
    clearSession();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      sessionId: null,
      sessionHref: null,
    });
  }, []);

  const hydrateFromStorage = useCallback(async () => {
    reconcileStaleSession();
    const stored = readSession();

    if (!stored.token || !stored.userId) {
      setState((prev) => ({ ...prev, isLoading: false, isAuthenticated: false }));
      return;
    }

    try {
      const user = await authApi.getUser(stored.userId);
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token: stored.token,
        sessionId: stored.sessionId,
        sessionHref: stored.sessionHref,
      });
    } catch {
      applyLoggedOut();
    }
  }, [applyLoggedOut]);

  useEffect(() => {
    setOnUnauthorized(applyLoggedOut);
    void hydrateFromStorage();
  }, [applyLoggedOut, hydrateFromStorage]);

  const login = useCallback(async (username: string, password: string) => {
    const { session, user } = await authApi.login(username, password);
    setState({
      isAuthenticated: true,
      isLoading: false,
      user,
      token: readSession().token,
      sessionId: session._id,
      sessionHref: session._links?.self?.href ?? null,
    });
  }, []);

  const logout = useCallback(async () => {
    const href = readSession().sessionHref;
    await authApi.logout(href);
    applyLoggedOut();
  }, [applyLoggedOut]);

  const refreshUser = useCallback(async () => {
    const stored = readSession();
    if (!stored.userId) return;
    const user = await authApi.getUser(stored.userId);
    setState((prev) => ({ ...prev, user }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, logout, refreshUser }),
    [state, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function getLoginErrorCode(err: unknown): string {
  if (err instanceof LiveblogApiError) {
    if (err.status === 401) return '401';
    if (err.status === 403) return '403';
    if (err.status === 404) return '404';
  }
  if (err instanceof TypeError) return 'network';
  return 'unknown';
}
