import { describe, expect, it, vi, beforeEach } from 'vitest';
import { resolveEmbed } from './resolveEmbed';
import * as iframely from './services/iframely';

vi.mock('./services/iframely', () => ({
  fetchOembed: vi.fn(),
  IframelyError: class IframelyError extends Error {},
  IFRAMELY_PUBLIC_KEY: 'test-key',
}));

describe('resolveEmbed', () => {
  beforeEach(() => {
    vi.mocked(iframely.fetchOembed).mockReset();
  });

  it('returns raw HTML for embed code input', async () => {
    const html = '<iframe src="https://example.com"></iframe>';
    const meta = await resolveEmbed(html);
    expect(meta.html).toBe(html);
    expect(meta.provider_name).toBe('Embed');
  });

  it('uses twitter handler for twitter URLs', async () => {
    vi.mocked(iframely.fetchOembed).mockResolvedValue({
      provider_name: 'Twitter',
      description: 'Hello',
      title: 'Tweet',
      author_name: 'user',
      url: 'https://twitter.com/x/status/1',
      html: '<div class="iframely-embed"><a href="https://twitter.com/x/status/1">Tweet</a></div>',
    });

    const meta = await resolveEmbed('https://twitter.com/elonmusk/status/123');
    expect(meta.provider_name).toBe('Twitter');
    expect(meta.html).toContain('iframely-embed');
    expect(meta.original_url).toContain('twitter.com');
    expect(iframely.fetchOembed).toHaveBeenCalled();
  });

  it('falls back to iframely for generic URLs', async () => {
    vi.mocked(iframely.fetchOembed).mockResolvedValue({
      provider_name: 'Example',
      provider_url: 'https://example.com',
      html: '<p>card</p>',
      url: 'https://example.com/article',
    });

    const meta = await resolveEmbed('https://example.com/article');
    expect(meta.html).toBe('<p>card</p>');
    expect(meta.original_url).toBe('https://example.com/article');
  });
});
