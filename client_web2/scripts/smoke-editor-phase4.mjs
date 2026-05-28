const API = 'http://localhost:5000/api';

async function authFetch(path, token, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok || text.startsWith('<')) {
    throw new Error(`${path} failed ${res.status}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

async function main() {
  const session = await authFetch('/auth_db', null, {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });
  if (!session.token) {
    console.error('login failed');
    process.exit(1);
  }
  console.log('login ok');

  const blogs = await authFetch(
    `/blogs?max_results=1&where=${encodeURIComponent(JSON.stringify({ blog_status: 'open' }))}`,
    session.token,
  );
  const blogId = blogs._items?.[0]?._id;
  if (!blogId) {
    console.error('no open blog');
    process.exit(1);
  }
  console.log('blog', blogId);

  const outputs = await authFetch(
    `/outputs?where=${encodeURIComponent(JSON.stringify({ blog: blogId, deleted: { $ne: true } }))}&max_results=10`,
    session.token,
  );
  console.log('outputs ok', outputs._items?.length ?? 0);

  const consumers = await authFetch('/consumers?max_results=5', session.token);
  console.log('consumers ok', consumers._items?.length ?? 0);

  const collections = await authFetch(
    `/collections?where=${encodeURIComponent(JSON.stringify({ deleted: false }))}&max_results=5`,
    session.token,
  );
  console.log('collections ok', collections._items?.length ?? 0);

  const pollBody = {
    question: 'Smoke poll?',
    answers: [
      { option: 'Yes', votes: 0 },
      { option: 'No', votes: 0 },
    ],
    active_until: new Date(Date.now() + 3600_000).toISOString(),
  };
  const poll = await authFetch('/polls', session.token, {
    method: 'POST',
    body: JSON.stringify({ blog: blogId, poll_body: pollBody }),
  });
  console.log('poll created', poll._id);

  if (poll._id) {
    await authFetch(`/polls/${poll._id}`, session.token, { method: 'DELETE' }).catch(() => {
      console.log('poll delete skipped (may require PATCH deleted)');
    });
  }

  console.log('phase4 smoke passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
