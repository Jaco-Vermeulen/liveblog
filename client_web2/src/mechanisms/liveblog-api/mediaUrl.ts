/**
 * Rewrite absolute Superdesk upload URLs to same-origin paths.
 *
 * With LIVEBLOG_MULTI_HOST, the API may bake the request Host into media hrefs
 * (e.g. maroelablog.jnb1.cloudlet.cloud). That host often has a broken TLS cert,
 * so <img> tags fail. Relative /api/upload(-raw)/… loads via the current origin.
 */
export function normalizeMediaHref(href: string | null | undefined): string {
  const trimmed = String(href ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;

  try {
    const url = new URL(trimmed);
    const path = `${url.pathname}${url.search}`;
    if (
      path.startsWith('/api/upload-raw/') ||
      path.startsWith('/api/upload/') ||
      path.startsWith('/upload-raw/') ||
      path.startsWith('/upload/')
    ) {
      return path.startsWith('/api/') ? path : `/api${path}`;
    }
  } catch {
    // Not an absolute URL — return as-is.
  }

  return trimmed;
}

export function normalizeRenditionHrefs<T extends Record<string, { href?: string } | undefined>>(
  renditions: T,
): T {
  const next = { ...renditions };
  for (const [key, value] of Object.entries(next)) {
    if (!value?.href) continue;
    next[key as keyof T] = {
      ...value,
      href: normalizeMediaHref(value.href),
    } as T[keyof T];
  }
  return next;
}
