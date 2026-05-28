import { describe, expect, it } from 'vitest';
import { IFRAMELY_PUBLIC_KEY } from './iframely';
import { getIframelyEmbedScriptUrl } from './iframelyEmbedJs';

describe('iframelyEmbedJs', () => {
  it('uses cdn.iframe.ly with key query param like legacy themes', () => {
    const url = getIframelyEmbedScriptUrl();
    expect(url).toContain('https://cdn.iframe.ly/embed.js');
    expect(url).toContain(`key=${encodeURIComponent(IFRAMELY_PUBLIC_KEY)}`);
  });
});
