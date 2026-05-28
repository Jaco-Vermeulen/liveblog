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

  const users = await get('/users?max_results=5&page=1', token);
  console.log('users list ok', users._items?.length ?? 0);

  const roles = await get('/roles?max_results=10', token);
  console.log('roles ok', roles._items?.length ?? 0);

  const searchWhere = encodeURIComponent(
    JSON.stringify({
      $or: [{ username: { $regex: 'admin', $options: 'i' } }],
    }),
  );
  const search = await get(`/users?max_results=5&where=${searchWhere}`, token);
  console.log('users search ok', search._items?.length ?? 0);

  const adminId = users._items?.[0]?._id;
  if (adminId) {
    const user = await get(`/users/${adminId}`, token);
    console.log('user get ok', user.username);
  }

  console.log('user-manager smoke passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
