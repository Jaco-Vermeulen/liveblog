/** Port of legacy `embed/helpers.ts` `guessProvider`. */
export function guessProvider(url: string): { url: string; name: string } {
  const fullDomain = domainFromUrl(url);
  const domain = fullDomain.split('.')[0] ?? 'Embed';
  const anchor = document.createElement('a');
  anchor.href = url;

  return {
    url: anchor.origin,
    name: domain.charAt(0).toUpperCase() + domain.slice(1),
  };
}

function domainFromUrl(url: string): string {
  let result = '';
  let match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?=]+)/im);
  if (match) {
    result = match[1];
    match = result.match(/^[^.]+\.(.+\..+)$/);
    if (match) {
      result = match[1];
    }
  }
  return result;
}
