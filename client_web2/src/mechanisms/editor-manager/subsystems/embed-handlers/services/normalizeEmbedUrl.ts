/** Decode once when embed-block passes an encoded URL (legacy iframely-public-key.js). */
export function normalizeEmbedUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  let normalized = url.trim();

  try {
    if (/%[0-9A-Fa-f]{2}/.test(normalized)) {
      const decoded = decodeURIComponent(normalized.replace(/\+/g, ' '));
      if (/^https?:\/\//i.test(decoded)) {
        normalized = decoded;
      }
    }
  } catch {
    // keep original
  }

  return normalized;
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function looksLikeEmbedCode(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('<')) return true;
  return /<(iframe|blockquote)/i.test(trimmed);
}
