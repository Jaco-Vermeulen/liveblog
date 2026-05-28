import { describe, expect, it } from 'vitest';
import { needsIframelyEmbedJs, pickDisplayHtml } from './pickDisplayHtml';

describe('pickDisplayHtml', () => {
  it('prefers meta.html over legacy card wrapper', () => {
    const html = pickDisplayHtml(
      {
        html: '<div class="iframely-embed"><a href="https://x.com">x</a></div>',
        provider_name: 'Twitter',
      },
      '<div class="liveblog--card"><div class="hidden embed-preview">old</div></div>',
    );
    expect(html).toContain('iframely-embed');
  });

  it('extracts embed-preview from Sir Trevor card', () => {
    const card =
      '<div class="liveblog--card"><div class="embed-preview"><iframe src="https://youtube.com/embed/1"></iframe></div></div>';
    const html = pickDisplayHtml({}, card);
    expect(html).toContain('iframe');
  });

  it('falls back to thumbnail image', () => {
    const html = pickDisplayHtml({
      thumbnail_url: 'https://example.com/thumb.jpg',
      provider_name: 'Photo',
    });
    expect(html).toContain('<img');
    expect(html).toContain('thumb.jpg');
  });

  it('detects iframely card markup', () => {
    expect(needsIframelyEmbedJs('<div class="iframely-embed"></div>')).toBe(true);
    expect(needsIframelyEmbedJs('<iframe src="x"></iframe>')).toBe(false);
  });
});
