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
  const auth = `Basic ${Buffer.from(`${session.token}:`).toString('base64')}`;
  return { auth, userId: session.user };
}

async function get(path, auth) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: auth } });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GET ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

async function patch(path, auth, body, etag) {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      'If-Match': etag,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`PATCH ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

async function main() {
  const { auth, userId } = await login();
  console.log('login ok', userId);

  const user = await get(`/users/${userId}`, auth);
  console.log('profile GET ok', user.username, user._etag);

  const activityWhere = encodeURIComponent(
    JSON.stringify({ 'recipients.user_id': userId }),
  );
  const activity = await get(
    `/activity?max_results=8&where=${activityWhere}&embedded=${encodeURIComponent(JSON.stringify({ user: 1 }))}`,
    auth,
  );
  console.log('activity GET ok', activity._items?.length ?? 0, 'items');

  const originalFirst = user.first_name ?? 'Admin';
  const testFirst = originalFirst === 'Admin' ? 'AdminX' : 'Admin';
  const patched = await patch(
    `/users/${userId}`,
    auth,
    { first_name: testFirst },
    user._etag,
  );
  console.log('profile PATCH ok', patched.first_name);

  await patch(`/users/${userId}`, auth, { first_name: originalFirst }, patched._etag);
  console.log('profile PATCH revert ok');

  console.log('smoke-profile-notifications: PASS');
}

main().catch((err) => {
  console.error('smoke-profile-notifications: FAIL', err.message);
  process.exit(1);
});
