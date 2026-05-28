/**
 * Smoke: Superdesk notification WebSocket on :5100
 * Usage: node scripts/smoke-websocket.mjs
 */
const url = process.env.VITE_LIVEBLOG_WS_URL || 'ws://localhost:5100';

const result = await new Promise((resolve) => {
  let ws;
  const timeout = setTimeout(() => {
    ws?.close();
    resolve({ ok: false, error: 'timeout (5s)' });
  }, 5000);

  try {
    ws = new WebSocket(url);
  } catch (err) {
    clearTimeout(timeout);
    resolve({ ok: false, error: String(err) });
    return;
  }

  ws.onopen = () => {
    clearTimeout(timeout);
    ws.close();
    resolve({ ok: true, url });
  };

  ws.onerror = () => {
    clearTimeout(timeout);
    resolve({ ok: false, error: 'connection failed' });
  };
});

if (result.ok) {
  console.log(`[smoke-websocket] OK connected to ${result.url}`);
  process.exit(0);
}

console.error(`[smoke-websocket] FAIL ${url}: ${result.error}`);
console.error('[smoke-websocket] Start Docker stack wamp process on port 5100');
process.exit(1);
