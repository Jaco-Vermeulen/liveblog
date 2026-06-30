import { describe, expect, it, vi } from 'vitest';
import { getDefaultWsUrl } from './wamp-client';

describe('getDefaultWsUrl', () => {
  it('derives ws URL from window when env is same-origin', () => {
    vi.stubEnv('VITE_LIVEBLOG_WS_URL', 'same-origin');
    vi.stubGlobal('window', {
      location: { protocol: 'https:', host: 'live.example.com' },
    } as Window);
    expect(getDefaultWsUrl()).toBe('wss://live.example.com/ws');
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses explicit env URL when set', () => {
    vi.stubEnv('VITE_LIVEBLOG_WS_URL', 'wss://custom.example/ws');
    expect(getDefaultWsUrl()).toBe('wss://custom.example/ws');
    vi.unstubAllEnvs();
  });
});
