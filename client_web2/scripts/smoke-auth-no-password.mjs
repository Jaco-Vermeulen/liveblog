/**
 * User invited without password must get 401 on login, not 500 (AttributeError).
 * Server fix: liveblog/auth/db.py (AccessAuthService.authenticate guard).
 */
const API = process.env.SUPERDESK_URL || 'http://localhost:5000/api';

async function main() {
  const login = await fetch(`${API}/auth_db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });
  if (!login.ok) {
    throw new Error(`admin login ${login.status}: ${await login.text()}`);
  }
  const session = await login.json();
  const h = { Authorization: session.token, 'Content-Type': 'application/json' };

  const roles = await (await fetch(`${API}/roles?max_results=1`, { headers: h })).json();
  const stamp = Date.now();
  const username = `smoke_nopw_${stamp}`;
  const email = `${username}@example.com`;

  const createRes = await fetch(`${API}/users`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      first_name: 'Smoke',
      last_name: 'NoPw',
      username,
      email,
      user_type: 'user',
      role: roles._items[0]._id,
    }),
  });
  if (!createRes.ok) {
    throw new Error(`create user ${createRes.status}: ${await createRes.text()}`);
  }
  console.log('user created without password', username);

  const attempt = await fetch(`${API}/auth_db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'anything' }),
  });
  const body = await attempt.text();
  console.log('login attempt status', attempt.status, body.slice(0, 200));

  if (attempt.status === 500) {
    console.error('FAIL: 500 — AttributeError still breaks error handler');
    process.exit(1);
  }
  if (attempt.status !== 401) {
    console.error('FAIL: expected 401, got', attempt.status);
    process.exit(1);
  }
  if (!body.includes('credentials')) {
    console.error('FAIL: expected credentials error payload');
    process.exit(1);
  }
  console.log('PASS smoke-auth-no-password');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
