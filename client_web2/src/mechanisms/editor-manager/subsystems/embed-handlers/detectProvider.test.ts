import { describe, expect, it } from 'vitest';
import { detectEmbedProvider } from './detectProvider';

describe('detectEmbedProvider', () => {
  it('detects Twitter URLs', () => {
    expect(
      detectEmbedProvider('https://twitter.com/user/status/1234567890').id,
    ).toBe('twitter');
  });

  it('detects Facebook URLs', () => {
    expect(detectEmbedProvider('https://www.facebook.com/page/posts/1').id).toBe('facebook');
  });

  it('detects image URLs', () => {
    expect(detectEmbedProvider('https://example.com/photo.jpg').id).toBe('picture');
  });

  it('falls back to generic for unknown hosts', () => {
    const match = detectEmbedProvider('https://example.org/article');
    expect(match.id).toBe('generic');
    expect(match.label).toBe('Example');
  });
});
