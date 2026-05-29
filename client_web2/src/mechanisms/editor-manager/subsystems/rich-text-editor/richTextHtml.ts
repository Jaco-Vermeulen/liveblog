/** Detect whether post text is HTML (rich editor) vs plain text. */
export function isRichTextHtml(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  if (/<(?:p|div|br|h[1-6]|ul|ol|li|blockquote|b|strong|i|em|u|a|span)\b/i.test(value)) {
    return true;
  }
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

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'div',
  'h2',
  'h3',
  'blockquote',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'span',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  span: new Set(['style']),
  p: new Set(['style']),
  div: new Set(['style']),
  h2: new Set(['style']),
  h3: new Set(['style']),
};

const ALLOWED_STYLE_PROPS = new Set([
  'text-align',
  'font-weight',
  'font-style',
  'text-decoration',
]);

function sanitizeStyle(style: string): string {
  const parts = style
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const safe: string[] = [];
  for (const part of parts) {
    const colon = part.indexOf(':');
    if (colon < 0) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim().toLowerCase();
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    if (prop === 'text-align' && !['left', 'center', 'right', 'justify'].includes(value)) {
      continue;
    }
    safe.push(`${prop}: ${part.slice(colon + 1).trim()}`);
  }
  return safe.join('; ');
}

function sanitizeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) {
    return Array.from(el.childNodes).map(sanitizeNode).join('');
  }
  const allowedAttrs = ALLOWED_ATTRS[tag];
  const attrs: string[] = [];
  if (allowedAttrs) {
    for (const name of allowedAttrs) {
      const raw = el.getAttribute(name);
      if (!raw) continue;
      if (name === 'style') {
        const style = sanitizeStyle(raw);
        if (style) attrs.push(`style="${style}"`);
      } else if (name === 'href' && /^https?:\/\//i.test(raw)) {
        attrs.push(`${name}="${raw}"`);
      } else if (name !== 'href') {
        attrs.push(`${name}="${raw}"`);
      }
    }
  }
  const inner = Array.from(el.childNodes).map(sanitizeNode).join('');
  if (tag === 'br') return '<br>';
  const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
  return `<${tag}${attrStr}>${inner}</${tag}>`;
}

/** Strip unsafe markup while keeping editor formatting for live themes. */
export function sanitizeRichTextHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || isEmptyRichTextHtml(trimmed)) return '';
  if (typeof DOMParser === 'undefined') {
    return trimmed;
  }
  const doc = new DOMParser().parseFromString(trimmed, 'text/html');
  const body = doc.body;
  const sanitized = Array.from(body.childNodes).map(sanitizeNode).join('').trim();
  if (!sanitized || isEmptyRichTextHtml(sanitized)) return '';
  return sanitized;
}

export function normalizeRichTextHtml(html: string): string {
  return sanitizeRichTextHtml(html);
}
