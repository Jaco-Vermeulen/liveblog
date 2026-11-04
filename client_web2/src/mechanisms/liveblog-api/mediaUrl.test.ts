import { describe, expect, it } from 'vitest';
import { normalizeMediaHref, normalizeRenditionHrefs } from './mediaUrl';

describe('normalizeMediaHref', () => {
  it('rewrites absolute upload-raw URLs to same-origin paths', () => {
    expect(
      normalizeMediaHref(
        'https://maroelablog.jnb1.cloudlet.cloud/api/upload-raw/6aeac629f83fd23c63f01b45.jpg',
      ),
    ).toBe('/api/upload-raw/6aeac629f83fd23c63f01b45.jpg');
  });

  it('rewrites absolute /api/upload/…/raw URLs', () => {
    expect(
      normalizeMediaHref(
        'http://localhost:5000/api/upload/5aba336a4d003d44ee714c0f/raw?_schema=http',
      ),
    ).toBe('/api/upload/5aba336a4d003d44ee714c0f/raw?_schema=http');
  });

  it('leaves relative upload paths unchanged', () => {
    expect(normalizeMediaHref('/api/upload-raw/abc.jpg')).toBe('/api/upload-raw/abc.jpg');
  });

  it('leaves unrelated absolute URLs unchanged', () => {
    expect(normalizeMediaHref('https://cdn.example.com/photo.jpg')).toBe(
      'https://cdn.example.com/photo.jpg',
    );
  });

  it('normalizes rendition href maps', () => {
    expect(
      normalizeRenditionHrefs({
        viewImage: {
          href: 'https://maroelablog.jnb1.cloudlet.cloud/api/upload-raw/abc.jpg',
        },
        thumbnail: { href: '/api/upload-raw/thumb.jpg' },
      }),
    ).toEqual({
      viewImage: { href: '/api/upload-raw/abc.jpg' },
      thumbnail: { href: '/api/upload-raw/thumb.jpg' },
    });
  });
});
