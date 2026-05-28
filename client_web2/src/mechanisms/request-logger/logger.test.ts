import { afterEach, describe, expect, it } from 'vitest';
import { __resetLoggerForTests, logger } from './logger';

afterEach(() => {
  __resetLoggerForTests();
});

describe('request-logger', () => {
  it('caps history at 200 entries', () => {
    for (let i = 0; i < 210; i += 1) {
      logger.request('GET', `/api/items/${i}`);
    }
    expect(logger.getHistory()).toHaveLength(200);
  });

  it('returns newest-first order', () => {
    logger.request('GET', '/api/a');
    logger.request('POST', '/api/b');
    const [first, second] = logger.getHistory();
    expect(first.url).toBe('/api/b');
    expect(second.url).toBe('/api/a');
  });

  it('links request id to response entry', () => {
    const id = logger.request('POST', '/api/auth_db');
    logger.response(id, 200, 42, '/api/auth_db');
    const response = logger.getHistory().find((e) => e.direction === 'response');
    expect(response?.id).toBe(id);
    expect(response?.status).toBe(200);
    expect(response?.durationMs).toBe(42);
  });

  it('records error direction', () => {
    const id = logger.request('GET', '/api/fail');
    logger.error(id, 'Network error', '/api/fail');
    const err = logger.getHistory().find((e) => e.direction === 'error');
    expect(err?.message).toBe('Network error');
  });

  it('clears history', () => {
    logger.request('GET', '/api/x');
    logger.clearHistory();
    expect(logger.getHistory()).toHaveLength(0);
  });
});
