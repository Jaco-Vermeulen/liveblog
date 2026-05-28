import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetLoggerForTests } from '@/mechanisms/request-logger';
import { LiveblogWsEvent } from './events';
import { __resetWsManagerForTests, wsManager } from './manager';
import { RECONNECT_INTERVAL_MS } from './wamp-client';

type MockWebSocketInstance = {
  url: string;
  readyState: number;
  onopen: (() => void) | null;
  onclose: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((event: Event) => void) | null;
  close: ReturnType<typeof vi.fn>;
};

const instances: MockWebSocketInstance[] = [];

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  });

  constructor(public url: string) {
    instances.push(this);
    queueMicrotask(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    });
  }
}

describe('wsManager', () => {
  beforeEach(() => {
    vi.stubGlobal('WebSocket', MockWebSocket);
    __resetLoggerForTests();
    __resetWsManagerForTests();
    instances.length = 0;
  });

  afterEach(() => {
    __resetWsManagerForTests();
    vi.unstubAllGlobals();
  });

  it('transitions to connected and emits Connected', async () => {
    const states: string[] = [];
    const connected = vi.fn();

    wsManager.onStateChange(() => states.push(wsManager.getState()));
    wsManager.subscribe(LiveblogWsEvent.Connected, connected);

    await wsManager.connect('ws://test.local');

    await vi.waitFor(() => {
      expect(wsManager.getState()).toBe('connected');
    });
    expect(connected).toHaveBeenCalled();
    expect(states).toContain('connected');
  });

  it('dispatches server messages to typed subscribers', async () => {
    const onPosts = vi.fn();

    wsManager.subscribe(LiveblogWsEvent.Posts, onPosts);
    await wsManager.connect('ws://test.local');

    await vi.waitFor(() => expect(instances[0]?.readyState).toBe(MockWebSocket.OPEN));

    instances[0]?.onmessage?.({
      data: JSON.stringify({
        event: 'posts',
        extra: { posts: [{ _id: 'p1', blog: 'b1' }] },
      }),
    });

    expect(onPosts).toHaveBeenCalledWith({
      posts: [{ _id: 'p1', blog: 'b1' }],
    });
  });

  it('does not spuriously disconnect on repeated connect()', async () => {
    const disconnected = vi.fn();
    wsManager.subscribe(LiveblogWsEvent.Disconnected, disconnected);

    await wsManager.connect('ws://test.local');
    await vi.waitFor(() => expect(wsManager.getState()).toBe('connected'));

    await wsManager.connect('ws://test.local');
    expect(disconnected).not.toHaveBeenCalled();
    expect(wsManager.getState()).toBe('connected');
  });

  it('reconnects once after server close (no 5s loop)', async () => {
    vi.useFakeTimers();
    const disconnected = vi.fn();
    wsManager.subscribe(LiveblogWsEvent.Disconnected, disconnected);

    await wsManager.connect('ws://test.local');
    await vi.waitFor(() => expect(wsManager.getState()).toBe('connected'));

    instances[0]?.close();
    expect(disconnected).toHaveBeenCalledTimes(1);
    expect(wsManager.getState()).toBe('disconnected');

    await vi.advanceTimersByTimeAsync(RECONNECT_INTERVAL_MS);
    await vi.waitFor(() => expect(wsManager.getState()).toBe('connected'));

    disconnected.mockClear();
    await vi.advanceTimersByTimeAsync(RECONNECT_INTERVAL_MS + 1000);
    expect(disconnected).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('unsubscribes handlers', async () => {
    const handler = vi.fn();
    const unsub = wsManager.subscribe(LiveblogWsEvent.Blog, handler);
    unsub();

    await wsManager.connect('ws://test.local');
    await vi.waitFor(() => expect(instances[0]?.readyState).toBe(MockWebSocket.OPEN));

    instances[0]?.onmessage?.({
      data: JSON.stringify({
        event: 'blog',
        extra: { blog_id: 'b1', published: 1 },
      }),
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
