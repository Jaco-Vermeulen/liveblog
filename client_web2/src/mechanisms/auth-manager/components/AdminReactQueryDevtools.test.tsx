import { describe, expect, it, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, cleanup } from '@testing-library/react';
import { AuthContext } from '../context/AuthProvider';
import type { AuthContextValue } from '../types';
import { AdminReactQueryDevtools } from './AdminReactQueryDevtools';

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="react-query-devtools" />,
}));

function renderWithAuth(state: AuthContextValue['state']) {
  const value: AuthContextValue = {
    state,
    login: async () => {},
    logout: async () => {},
    refreshUser: async () => {},
  };

  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>
        <AdminReactQueryDevtools />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('AdminReactQueryDevtools', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders devtools for administrators', () => {
    renderWithAuth({
      isAuthenticated: true,
      isLoading: false,
      user: { _id: '1', username: 'admin', user_type: 'administrator' },
      token: 'token',
      sessionId: 'session',
      sessionHref: null,
    });

    expect(screen.getByTestId('react-query-devtools')).toBeTruthy();
  });

  it('does not render devtools for non-administrators', () => {
    renderWithAuth({
      isAuthenticated: true,
      isLoading: false,
      user: { _id: '2', username: 'editor', user_type: 'user', role: 'editor' },
      token: 'token',
      sessionId: 'session',
      sessionHref: null,
    });

    expect(screen.queryByTestId('react-query-devtools')).toBeNull();
  });

  it('does not render devtools when logged out', () => {
    renderWithAuth({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      sessionId: null,
      sessionHref: null,
    });

    expect(screen.queryByTestId('react-query-devtools')).toBeNull();
  });
});
