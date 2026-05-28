import { describe, expect, it, vi } from 'vitest';
import { __resetLoggerForTests } from '@/mechanisms/request-logger';
import { createSuperdeskWsClient } from './wamp-client';

describe('createSuperdeskWsClient', () => {
  it('parses { event, extra } JSON payloads', async () => {
    __resetLoggerForTests();
    const onMessage = vi.fn();
    let socket: {
      onopen: (() => void) | null;
      onmessage: ((e: { data: string }) => void) | null;
    } | null = null;

    vi.stubGlobal(
      'WebSocket',
      class {
        onopen: (() => void) | null = null;
        onmessage: ((e: { data: string }) => void) | null = null;
        onclose: (() => void) | null = null;
        onerror: (() => void) | null = null;
        close() {}
        constructor(public url: string) {
          socket = this;
          queueMicrotask(() => this.onopen?.());
        }
      },
    );

    const client = createSuperdeskWsClient('ws://localhost:5100', {
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onMessage,
    });

    client.connect();
    await vi.waitFor(() => expect(socket).not.toBeNull());

    socket!.onmessage?.({
      data: JSON.stringify({ event: 'posts', extra: { updated: true } }),
    });

    expect(onMessage).toHaveBeenCalledWith({
      event: 'posts',
      extra: { updated: true },
    });

    vi.unstubAllGlobals();
  });
});
