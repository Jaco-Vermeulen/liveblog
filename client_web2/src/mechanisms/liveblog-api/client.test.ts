import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetLoggerForTests, logger } from '@/mechanisms/request-logger';
import { apiRequest, LiveblogApiError } from './client';

afterEach(() => {
  __resetLoggerForTests();
  vi.unstubAllGlobals();
});

describe('liveblog-api client', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      }),
    );
  });

  it('logs request and response on success', async () => {
    await apiRequest('/health', { skipAuth: true });
    const history = logger.getHistory();
    expect(history.some((e) => e.direction === 'request')).toBe(true);
    expect(history.some((e) => e.direction === 'response' && e.status === 200)).toBe(true);
  });

  it('throws LiveblogApiError on HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ _error: { message: 'Unauthorized' } }),
      }),
    );

    await expect(apiRequest('/auth_db', { method: 'POST', skipAuth: true })).rejects.toBeInstanceOf(
      LiveblogApiError,
    );
    expect(logger.getHistory().some((e) => e.direction === 'error')).toBe(true);
  });
});
