import { describe, expect, it } from 'vitest';
import { isEmptyRichTextHtml, isRichTextHtml, normalizeRichTextHtml } from './richTextHtml';

describe('richTextHtml', () => {
  it('detects HTML content', () => {
    expect(isRichTextHtml('<p>Hello</p>')).toBe(true);
    expect(isRichTextHtml('plain text')).toBe(false);
  });

  it('treats empty html as empty', () => {
    expect(isEmptyRichTextHtml('')).toBe(true);
    expect(isEmptyRichTextHtml('<br>')).toBe(true);
    expect(isEmptyRichTextHtml('<p>Hi</p>')).toBe(false);
  });

  it('normalizes empty to empty string', () => {
    expect(normalizeRichTextHtml('<br>')).toBe('');
    expect(normalizeRichTextHtml('<p>x</p>')).toBe('<p>x</p>');
  });
});
