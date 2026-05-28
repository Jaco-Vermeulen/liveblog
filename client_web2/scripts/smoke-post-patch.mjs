/**
 * Smoke: POST item + PATCH post (reproduces editor save).
 * Run: node client_web2/scripts/smoke-post-patch.mjs
 */
const API = process.env.LIVEBLOG_API_URL ?? 'http://localhost:5000/api';
const USER = process.env.LIVEBLOG_USER ?? 'admin';
const PASS = process.env.LIVEBLOG_PASS ?? 'admin';

async function api(method, path, body, token, etag) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;
  if (etag) headers['If-Match'] = etag;
  const url = `${API}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, json };
}

async function main() {
  const login = await api('POST', '/auth_db', { username: USER, password: PASS });
  if (!login.ok) {
    console.error('login failed', login.status, login.json);
    process.exit(1);
  }
  const token = login.json.token;
  console.log('login ok');

  const blogs = await api('GET', '/blogs?max_results=1', undefined, token);
  const blogId = blogs.json?._items?.[0]?._id;
  if (!blogId) {
    console.error('no blog');
    process.exit(1);
  }
  console.log('blog', blogId);

  const itemRes = await api(
    'POST',
    '/items',
    {
      blog: blogId,
      item_type: 'embed',
      group_type: 'default',
      text: '<blockquote class="twitter-tweet"></blockquote>',
      meta: {
        provider_name: 'Twitter',
        original_url: 'https://twitter.com/jack/status/20',
        html: '<blockquote class="twitter-tweet"></blockquote>',
        liveblog_version: '3.4',
      },
    },
    token,
  );
  console.log('POST /items', itemRes.status, itemRes.ok ? 'ok' : itemRes.json);
  if (!itemRes.ok) process.exit(1);
  const itemId = itemRes.json._id;
  console.log('itemId', itemId);

  const postCreate = await api(
    'POST',
    '/posts',
    {
      blog: blogId,
      post_status: 'open',
      sticky: false,
      lb_highlight: false,
      groups: [
        { id: 'root', refs: [{ idRef: 'main' }], role: 'grpRole:NEP' },
        {
          id: 'main',
          refs: [{ residRef: itemId }],
          role: 'grpRole:Main',
        },
      ],
    },
    token,
  );
  console.log('POST /posts', postCreate.status, postCreate.ok ? 'ok' : postCreate.json);
  if (!postCreate.ok) process.exit(1);

  const postId = postCreate.json._id;
  const etag = postCreate.json._etag;
  console.log('postId', postId);

  const item2 = await api(
    'POST',
    '/items',
    {
      blog: blogId,
      item_type: 'text',
      group_type: 'default',
      text: 'Updated body',
    },
    token,
  );
  if (!item2.ok) {
    console.error('item2 failed', item2.json);
    process.exit(1);
  }

  const patchBody = {
    blog: blogId,
    post_status: 'open',
    sticky: false,
    lb_highlight: false,
    groups: [
      { id: 'root', refs: [{ idRef: 'main' }], role: 'grpRole:NEP' },
      {
        id: 'main',
        refs: [{ residRef: item2.json._id }],
        role: 'grpRole:Main',
      },
    ],
  };

  const encodedId = encodeURIComponent(postId);
  const patch = await api('PATCH', `/posts/${encodedId}`, patchBody, token, etag);
  console.log('PATCH encoded', patch.status, patch.ok ? 'ok' : JSON.stringify(patch.json, null, 2));

  const patchRaw = await api('PATCH', `/posts/${postId}`, patchBody, token, etag);
  console.log('PATCH raw', patchRaw.status, patchRaw.ok ? 'ok' : JSON.stringify(patchRaw.json, null, 2));

  const enriched = {
    ...postCreate.json,
    mainItem: { item: itemRes.json },
    items: [{ item: itemRes.json }],
    hasComments: false,
    multipleItems: false,
  };
  const patchBad = await api(
    'PATCH',
    `/posts/${encodeURIComponent(postId)}`,
    enriched,
    token,
    postCreate.json._etag,
  );
  console.log(
    'PATCH spread enriched (web2 bug)',
    patchBad.status,
    patchBad.ok ? 'ok' : JSON.stringify(patchBad.json, null, 2),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
