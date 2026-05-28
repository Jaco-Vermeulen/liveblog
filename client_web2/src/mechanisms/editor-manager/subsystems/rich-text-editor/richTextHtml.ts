/** Detect whether post text is HTML (rich editor) vs plain text. */
export function isRichTextHtml(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  return /<[a-z][\s\S]*>/i.test(value);
}

/** Empty editor placeholder HTML. */
export function isEmptyRichTextHtml(html: string): boolean {
  const stripped = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
  return stripped.length === 0;
}

export function normalizeRichTextHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || isEmptyRichTextHtml(trimmed)) return '';
  return trimmed;
}
