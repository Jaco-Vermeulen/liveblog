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
});
