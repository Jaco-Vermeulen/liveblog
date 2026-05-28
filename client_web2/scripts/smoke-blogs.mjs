const API = 'http://localhost:5000/api';

async function main() {
  const loginRes = await fetch(`${API}/auth_db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });
  const session = await loginRes.json();
  if (!session.token) {
    console.error('login failed', session);
    process.exit(1);
  }
  console.log('login ok');

  const variants = [
    {
      label: 'simple',
      params: new URLSearchParams({
        max_results: '3',
        where: JSON.stringify({ blog_status: 'open' }),
      }),
    },
    {
      label: 'es',
      params: new URLSearchParams({
        max_results: '3',
        embedded: JSON.stringify({ original_creator: 1 }),
        where: JSON.stringify({
          source: {
            query: {
              filtered: {
                filter: { term: { blog_status: 'open' } },
              },
            },
          },
        }),
      }),
    },
  ];

  for (const { label, params } of variants) {

    const url = `${API}/blogs?${params}`;
    const blogsRes = await fetch(url, {
      headers: { Authorization: session.token },
    });
    const text = await blogsRes.text();
    if (!blogsRes.ok || text.startsWith('<')) {
      console.log(label, 'failed', blogsRes.status);
      continue;
    }
    const blogs = JSON.parse(text);
    console.log(
      label,
      'ok',
      'total',
      blogs._meta?.total,
      'items',
      blogs._items?.length,
    );
    if (blogs._items?.[0]) {
      console.log('first', blogs._items[0].title);
    }
    return;
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
