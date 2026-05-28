const API = process.env.LIVEBLOG_API_URL ?? 'http://localhost:5000/api';

async function login() {
  const res = await fetch(`${API}/auth_db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });
  const session = await res.json();
  if (!session.token) {
    throw new Error(`login failed: ${JSON.stringify(session)}`);
  }
  return session.token;
}

async function downloadTheme(name, token) {
  const res = await fetch(`${API}/theme-download/${encodeURIComponent(name)}`, {
    headers: { Authorization: token },
  });
  const ct = res.headers.get('content-type') ?? '';
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${name} → HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  if (!ct.includes('zip')) {
    const body = await res.text();
    throw new Error(`${name} → expected zip, got ${ct}: ${body.slice(0, 200)}`);
  }
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 100) {
    throw new Error(`${name} → zip too small (${buf.byteLength} bytes)`);
  }
  return buf.byteLength;
}

async function main() {
  const token = await login();
  console.log('login ok');

  for (const name of ['tribute', 'tribute-light', 'classic']) {
    const bytes = await downloadTheme(name, token);
    console.log(`theme-download/${name} ok`, bytes, 'bytes');
  }

  console.log('theme-download smoke passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
