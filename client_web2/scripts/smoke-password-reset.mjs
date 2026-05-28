const API = 'http://localhost:5000/api';

async function main() {
  const stamp = Date.now();
  const login = await fetch(`${API}/auth_db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });
  const session = await login.json();
  const h = { Authorization: session.token, 'Content-Type': 'application/json' };

  const roles = await (await fetch(`${API}/roles?max_results=1`, { headers: h })).json();
  const roleId = roles._items[0]._id;
  const email = `smoke-reset-${stamp}@example.com`;
  const username = `smoke_reset_${stamp}`;

  const createRes = await fetch(`${API}/users`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      first_name: 'Smoke',
      last_name: 'Reset',
      username,
      email,
      user_type: 'user',
      role: roleId,
    }),
  });
  const created = await createRes.json();
  if (!createRes.ok) throw new Error(`create user ${createRes.status}: ${JSON.stringify(created)}`);
  console.log('user created without password', created._id);

  const resetRes = await fetch(`${API}/reset_user_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const resetDoc = await resetRes.json();
  if (!resetRes.ok) throw new Error(`reset initiate ${resetRes.status}: ${JSON.stringify(resetDoc)}`);
  console.log('reset email queued', resetDoc._id);

  const { execSync } = await import('node:child_process');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const token = execSync(
    `docker compose exec -T server python3 -c "from pymongo import MongoClient; d=MongoClient('mongodb://mongodb:27017/')['liveblog'].reset_user_password.find_one({'email':'${email}'}); print(d['token'] if d else '')"`,
    { cwd: repoRoot, encoding: 'utf8' },
  ).trim();
  if (!token) throw new Error('reset token not found in database');

  const completeRes = await fetch(`${API}/reset_user_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password: 'SmokePass99!' }),
  });
  const complete = await completeRes.json();
  if (!completeRes.ok) throw new Error(`reset complete ${completeRes.status}: ${JSON.stringify(complete)}`);
  console.log('password set via token');

  const userLogin = await fetch(`${API}/auth_db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'SmokePass99!' }),
  });
  if (!userLogin.ok) throw new Error(`login after reset ${userLogin.status}`);
  console.log('password-reset smoke passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
