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

  it('keeps allowed formatting tags', () => {
    expect(normalizeRichTextHtml('<p><strong>Bold</strong> <em>italic</em></p>')).toBe(
      '<p><strong>Bold</strong> <em>italic</em></p>',
    );
    expect(normalizeRichTextHtml('<p style="text-align: center">Center</p>')).toBe(
      '<p style="text-align: center">Center</p>',
    );
  });

  it('strips unsafe markup', () => {
    expect(normalizeRichTextHtml('<p>ok</p><script>alert(1)</script>')).not.toMatch(/<script/i);
    expect(normalizeRichTextHtml('<img src=x onerror=alert(1)>')).toBe('');
  });
});
