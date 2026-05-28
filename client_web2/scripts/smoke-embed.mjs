/**
 * Smoke: Iframely oEmbed resolution (external API, logged in browser via request-logger).
 * Run: node client_web2/scripts/smoke-embed.mjs
 */
const IFRAMELY_KEY = process.env.IFRAMELY_KEY || 'a5ee9a89addd13b7a2e3a48c23e74e8d';
const TEST_URL =
  process.env.EMBED_TEST_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

async function fetchOembed(url) {
  const params = new URLSearchParams({ key: IFRAMELY_KEY, url });
  const requestUrl = `https://iframe.ly/api/oembed?${params}`;
  console.log('[smoke-embed] GET', requestUrl.replace(IFRAMELY_KEY, '***'));
  const res = await fetch(requestUrl);
  const body = await res.json();
  if (!res.ok) {
    console.error('oembed failed', res.status, body);
    process.exit(1);
  }
  return body;
}

async function main() {
  const data = await fetchOembed(TEST_URL);
  console.log('provider', data.provider_name);
  console.log('has html', Boolean(data.html));
  console.log('title', data.title?.slice?.(0, 60));
  console.log('smoke-embed ok');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
