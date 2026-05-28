const API = process.env.LIVEBLOG_API_URL ?? 'http://localhost:5000/api';

async function api(method, path, body, token, etag) {
  const headers = { 'Content-Type': 'application/json', Authorization: token };
  if (etag) headers['If-Match'] = etag;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
}

const login = await api('POST', '/auth_db', { username: 'admin', password: 'admin' });
const token = login.json.token;
const blogs = await api('GET', '/blogs?max_results=1', undefined, token);
const blogId = blogs.json._items[0]._id;
const item = await api(
  'POST',
  '/items',
  {
    blog: blogId,
    item_type: 'text',
    group_type: 'default',
    text: 'hi',
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
let etag = post.json._etag;

const skip = new Set(['_id', '_etag', 'groups', 'blog', 'post_status']);
for (const key of Object.keys(post.json)) {
  if (skip.has(key)) continue;
  const body = {
    blog: blogId,
    post_status: 'open',
    [key]: post.json[key],
  };
  const r = await api('PATCH', `/posts/${encodeURIComponent(id)}`, body, token, etag);
  console.log(key, r.status, r.status === 400 ? r.json._error?.message : 'ok');
  if (r.status === 200 && r.json._etag) etag = r.json._etag;
}
