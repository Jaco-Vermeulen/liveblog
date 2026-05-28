const API = 'http://localhost:5000/api';

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

async function get(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: token },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GET ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

async function main() {
  const token = await login();
  console.log('login ok');

  const themes = await get('/themes?max_results=5', token);
  console.log('themes ok', themes._meta?.total, 'items', themes._items?.length);

  const first = themes._items?.[0];
  if (first?.name) {
    const one = await get(`/themes/${encodeURIComponent(first.name)}`, token);
    console.log('theme by name ok', one.name, 'options', one.options?.length ?? 0);
    if (one.supportStylesSettings) {
      console.log('styleOptions groups', one.styleOptions?.length ?? 0);
    }
  }

  const prefs = await get('/global_preferences?max_results=20', token);
  console.log('global_preferences ok', prefs._items?.length);

  const instance = await get('/instance_settings?max_results=1', token);
  console.log(
    'instance_settings ok',
    instance._items?.[0] ? Object.keys(instance._items[0].settings ?? {}).length : 0,
    'keys',
  );

  const languages = await get('/languages?max_results=5', token);
  console.log('languages ok', languages._items?.length);

  console.log('phase5 smoke passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
