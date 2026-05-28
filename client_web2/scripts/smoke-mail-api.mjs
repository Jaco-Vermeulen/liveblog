/**
 * API test: password-reset email via Mandrill.
 * Usage:
 *   TEST_EMAIL=geen-antwoord@maroelamedia.co.za node scripts/smoke-mail-api.mjs
 *
 * Requires Docker API :5000, MAIL_FROM in .env, user with TEST_EMAIL in DB.
 */
const API = process.env.SUPERDESK_URL || 'http://localhost:5000/api';
const TEST_EMAIL = process.env.TEST_EMAIL || 'geen-antwoord@maroelamedia.co.za';

async function api(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json, text };
}

async function main() {
  console.log('[smoke-mail-api] TEST_EMAIL:', TEST_EMAIL);
  console.log('[smoke-mail-api] API:', API);

  const login = await api('POST', '/auth_db', { username: 'admin', password: 'admin' });
  if (login.status !== 201) {
    throw new Error(`admin login ${login.status}: ${login.text}`);
  }
  const token = login.json.token;
  console.log('[smoke-mail-api] admin login OK');

  const users = await api('GET', `/users?where=${encodeURIComponent(JSON.stringify({ email: TEST_EMAIL }))}`, null, token);
  let user = users.json._items?.[0];
  if (!user) {
    const roles = await api('GET', '/roles?max_results=1', null, token);
    const stamp = Date.now();
    const created = await api(
      'POST',
      '/users',
      {
        first_name: 'Mail',
        last_name: 'Test',
        username: `mail_test_${stamp}`,
        email: TEST_EMAIL,
        user_type: 'user',
        role: roles.json._items[0]._id,
      },
      token,
    );
    if (created.status !== 201) {
      throw new Error(`create user ${created.status}: ${created.text}`);
    }
    user = created.json;
    console.log('[smoke-mail-api] created user', user.username, user._id);
  } else {
    console.log('[smoke-mail-api] found user', user.username, user._id);
  }

  const reset = await api('POST', '/reset_user_password', { email: TEST_EMAIL });
  if (reset.status !== 201) {
    throw new Error(`reset_user_password ${reset.status}: ${reset.text}`);
  }
  console.log('[smoke-mail-api] reset queued', reset.json._id);
  console.log('[smoke-mail-api] Check inbox + Mandrill outbound for:', TEST_EMAIL);
  console.log('[smoke-mail-api] MAIL_FROM should be geen-antwoord@maroelamedia.co.za (see .env)');
  console.log('[smoke-mail-api] PASS — API accepted reset; verify delivery in Mandrill/inbox');
}

main().catch((err) => {
  console.error('[smoke-mail-api] FAIL', err.message || err);
  process.exit(1);
});
