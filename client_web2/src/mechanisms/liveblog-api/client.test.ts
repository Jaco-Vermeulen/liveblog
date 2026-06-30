import { describe, expect, it, vi } from 'vitest';
import { resolveUrl } from './client';

describe('resolveUrl', () => {
  it('uses relative /api in dev', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_LIVEBLOG_API_URL', 'http://server:5000/api');
    expect(resolveUrl('/api/blogs')).toBe('/api/blogs');
    vi.unstubAllEnvs();
  });

  it('uses relative /api in prod when VITE_LIVEBLOG_API_URL is /api', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_LIVEBLOG_API_URL', '/api');
    expect(resolveUrl('blogs')).toBe('/api/blogs');
    vi.unstubAllEnvs();
  });

  it('uses full base URL in prod when absolute API URL is set', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_LIVEBLOG_API_URL', 'https://live.example.com/api');
    expect(resolveUrl('/api/blogs')).toBe('https://live.example.com/api/blogs');
    vi.unstubAllEnvs();
  });
});
