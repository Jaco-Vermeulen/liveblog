import { describe, expect, it } from 'vitest';
import { resolveBlogThemePreviewUrl } from './blogPreviewUrl';

describe('resolveBlogThemePreviewUrl', () => {
  it('falls back to embed path from blog id', () => {
    expect(resolveBlogThemePreviewUrl({ _id: 'abc123' } as never)).toMatch(/\/embed\/abc123/);
  });

  it('uses public_url path in dev when embed path', () => {
    const url = resolveBlogThemePreviewUrl({
      _id: 'x',
      public_url: 'http://localhost:5000/embed/blogid123',
    } as never);
    expect(url).toBe('/embed/blogid123');
  });

  it('prefers assigned theme over stale public_url theme', () => {
    const url = resolveBlogThemePreviewUrl({
      _id: 'blog1',
      blog_preferences: { theme: 'tribute-ultimate' },
      public_url: 'https://live.example.com/embed/blog1/theme/default',
    } as never);
    expect(url).toBe('/embed/blog1/theme/tribute-ultimate');
  });
});
