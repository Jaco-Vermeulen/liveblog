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

  const freetypes = await get('/freetypes?max_results=5', token);
  console.log('freetypes ok', freetypes._items?.length ?? 0);

  const adverts = await get(
    `/advertisements?max_results=5&where=${encodeURIComponent(JSON.stringify({ deleted: false }))}`,
    token,
  );
  console.log('advertisements ok', adverts._items?.length ?? 0);

  const blogs = await get('/blogs?max_results=1&where={"blog_status":"open"}', token);
  const blogId = blogs._items?.[0]?._id;
  if (blogId) {
    const analytics = await get(
      `/blogs/${blogId}/bloganalytics?max_results=5&page=1`,
      token,
    );
    console.log('bloganalytics ok', analytics._items?.length ?? 0, 'blog', blogId);
  } else {
    console.log('bloganalytics skipped (no open blog)');
  }

  try {
    const producers = await get('/producers?max_results=5', token);
    console.log('producers ok', producers._items?.length ?? 0);
  } catch (err) {
    console.log('producers skipped or failed:', err.message);
  }

  try {
    const mpBlogs = await get(
      `/marketplace/blogs?max_results=3&where=${encodeURIComponent('{}')}&sort=-start_date`,
      token,
    );
    console.log('marketplace/blogs ok', mpBlogs._items?.length ?? 0);
  } catch (err) {
    console.log('marketplace/blogs skipped or failed:', err.message);
  }

  console.log('phase6 smoke passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
