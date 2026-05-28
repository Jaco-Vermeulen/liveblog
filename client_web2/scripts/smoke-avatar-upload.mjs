const API = 'http://localhost:5000/api';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function login() {
  const res = await fetch(`${API}/auth_db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });
  const session = await res.json();
  if (!session.token) throw new Error(`login failed: ${JSON.stringify(session)}`);
  return session;
}

async function main() {
  const session = await login();
  const h = { Authorization: session.token };

  const form = new FormData();
  form.append('media', new Blob([PNG], { type: 'image/png' }), 'avatar.png');
  const upRes = await fetch(`${API}/upload`, { method: 'POST', headers: h, body: form });
  const uploaded = await upRes.json();
  if (!upRes.ok) throw new Error(`upload ${upRes.status}: ${JSON.stringify(uploaded)}`);
  console.log('upload ok', uploaded._id);

  const userRes = await fetch(`${API}/users/${session.user}`, { headers: h });
  const user = await userRes.json();

  const patchRes = await fetch(`${API}/users/${session.user}`, {
    method: 'PATCH',
    headers: { ...h, 'Content-Type': 'application/json', 'If-Match': user._etag },
    body: JSON.stringify({ avatar: uploaded._id }),
  });
  const patched = await patchRes.json();
  if (!patchRes.ok) throw new Error(`patch ${patchRes.status}: ${JSON.stringify(patched)}`);

  const check = await (await fetch(`${API}/users/${session.user}`, { headers: h })).json();
  const href = check.avatar_renditions?.viewImage?.href;
  if (!check.avatar || !href) {
    throw new Error('avatar renditions missing after patch');
  }
  console.log('avatar smoke passed', href.slice(0, 60));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
