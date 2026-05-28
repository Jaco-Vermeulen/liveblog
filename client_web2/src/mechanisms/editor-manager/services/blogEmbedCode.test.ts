import { describe, expect, it } from 'vitest';
import {
  buildBlogEmbedSnippets,
  pickBlogEmbedCode,
  resolveBlogPublicUrl,
} from './blogEmbedCode';

describe('blogEmbedCode', () => {
  it('uses public_url when present', () => {
    const url = resolveBlogPublicUrl({
      _id: 'abc',
      title: 'T',
      blog_status: 'open',
      original_creator: 'u1',
      public_url: 'http://example.com/embed/abc',
    });
    expect(url).toContain('example.com/embed/abc');
  });

  it('builds responsive and normal snippets', () => {
    const snippets = buildBlogEmbedSnippets('http://example.com/embed/x');
    expect(snippets.normal).toContain('height="715"');
    expect(snippets.responsive).toContain('data-responsive="yes"');
    expect(pickBlogEmbedCode(snippets, true)).toBe(snippets.responsive);
  });
});
