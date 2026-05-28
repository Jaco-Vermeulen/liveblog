/**
 * Repro: PATCH with enriched post fields → 400 (Werkzeug cannot understand request).
 */
const API = process.env.LIVEBLOG_API_URL ?? 'http://localhost:5000/api';

async function api(method, path, body, token, etag) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;
  if (etag) headers['If-Match'] = etag;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
}

const login = await api('POST', '/auth_db', { username: 'admin', password: 'admin' });
const token = login.json.token;
const blogs = await api('GET', '/blogs?max_results=1', null, token);
const blogId = blogs.json._items[0]._id;
const item = await api(
  'POST',
  '/items',
  {
    blog: blogId,
    item_type: 'embed',
    group_type: 'default',
    text: 'x',
    meta: { provider_name: 'Twitter', original_url: 'https://twitter.com/x/status/1' },
  },
  token,
);
const post = await api(
  'POST',
  '/posts',
  {
    blog: blogId,
    post_status: 'open',
    groups: [
      { id: 'root', refs: [{ idRef: 'main' }], role: 'grpRole:NEP' },
      { id: 'main', refs: [{ residRef: item.json._id }], role: 'grpRole:Main' },
    ],
  },
  token,
);
const id = post.json._id;
const etag = post.json._etag;

const enriched = {
  ...post.json,
  mainItem: { item: item.json },
  items: [{ item: item.json }],
  hasComments: false,
  multipleItems: false,
};

const bad = await api('PATCH', `/posts/${encodeURIComponent(id)}`, enriched, token, etag);
console.log('enriched PATCH', bad.status, bad.json._error?.message ?? bad.json);

const clean = await api(
  'PATCH',
  `/posts/${encodeURIComponent(id)}`,
  {
    blog: blogId,
    post_status: 'open',
    sticky: false,
    lb_highlight: false,
    groups: post.json.groups,
  },
  token,
  etag,
);
console.log('clean PATCH', clean.status);

const groupsWithItem = [
  { id: 'root', refs: [{ idRef: 'main' }], role: 'grpRole:NEP' },
  {
    id: 'main',
    refs: [{ residRef: item.json._id, item: item.json, type: 'embed' }],
    role: 'grpRole:Main',
  },
];
const nested = await api(
  'PATCH',
  `/posts/${encodeURIComponent(id)}`,
  { blog: blogId, post_status: 'open', groups: groupsWithItem },
  token,
  clean.json._etag ?? etag,
);
console.log('PATCH groups+item nested', nested.status, nested.json._error?.message ?? '');
