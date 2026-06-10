/** Add http:// when the user omits a scheme (browser + server expect a full URL). */
export function normalizeWebhookUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `http://${trimmed.replace(/^\/+/, '')}`;
}
