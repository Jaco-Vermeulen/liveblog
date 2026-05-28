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

  const blogsRes = await fetch(
    `${API}/blogs?max_results=1&where=${encodeURIComponent(JSON.stringify({ blog_status: 'open' }))}`,
    { headers: { Authorization: session.token } },
  );
  const blogs = await blogsRes.json();
  const blogId = blogs._items?.[0]?._id;
  if (!blogId) {
    console.error('no open blog found');
    process.exit(1);
  }
  console.log('blog', blogId, blogs._items[0].title);

  const source = JSON.stringify({
    query: {
      filtered: {
        filter: {
          and: [{ not: { term: { deleted: true } } }, { term: { post_status: 'open' } }],
        },
      },
    },
  });
  const postFilter = JSON.stringify({
    range: { published_date: { lte: new Date().toISOString() } },
  });

  const postsRes = await fetch(
    `${API}/blogs/${blogId}/posts?max_results=5&page=1&source=${encodeURIComponent(source)}&post_filter=${encodeURIComponent(postFilter)}`,
    { headers: { Authorization: session.token } },
  );
  const postsText = await postsRes.text();
  if (!postsRes.ok || postsText.startsWith('<')) {
    console.error('posts failed', postsRes.status, postsText.slice(0, 200));
    process.exit(1);
  }
  const posts = JSON.parse(postsText);
  console.log('posts ok', 'total', posts._meta?.total, 'items', posts._items?.length);

  const blogRes = await fetch(`${API}/blogs/${blogId}`, {
    headers: { Authorization: session.token },
  });
  if (!blogRes.ok) {
    console.error('get blog failed', blogRes.status);
    process.exit(1);
  }
  console.log('get blog ok');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
