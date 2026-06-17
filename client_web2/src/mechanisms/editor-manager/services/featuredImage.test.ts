import { describe, expect, it } from 'vitest';
import {
  buildFeaturedImageLibraryOptions,
  featuredImageSourceFromPost,
  featuredSourceFromArchivePicture,
  filenameFromImageUrl,
  isSameFeaturedSource,
  previewUrlFromImageItemText,
  resolveFeaturedImagePatch,
} from './featuredImage';
import type { Blog, Post } from '@/mechanisms/liveblog-api';
import type { SirTrevorBlock } from '../types';

const labels = {
  blogImage: 'Blog cover',
  blogImageMissing: 'Blog cover missing',
  postImage: (n: number) => `Post image ${n}`,
  libraryImage: (name: string) => name,
};

describe('featuredImage', () => {
  it('resolveFeaturedImagePatch omits featured fields for none on new posts', () => {
    const patch = resolveFeaturedImagePatch({ type: 'none' }, []);
    expect(patch).toEqual({});
  });

  it('resolveFeaturedImagePatch omits featured fields for blog on new posts', () => {
    const patch = resolveFeaturedImagePatch({ type: 'blog' }, []);
    expect(patch).toEqual({});
  });

  it('resolveFeaturedImagePatch clears featured image when editing an existing featured post', () => {
    const patch = resolveFeaturedImagePatch(
      { type: 'none' },
      [],
      {
        featured_image: 'img-1',
        featured_image_url: 'https://example.com/a.jpg',
      } as Post,
    );
    expect(patch?.featured_image_url).toBeNull();
    expect(patch?.featured_image_renditions).toEqual({});
  });

  it('resolveFeaturedImagePatch copies media from image block', () => {
    const blocks: SirTrevorBlock[] = [
      {
        type: 'Image',
        data: {
          picture_url: 'https://example.com/a.jpg',
          meta: {
            media: {
              _id: 'img-1',
              renditions: { viewImage: { href: 'https://example.com/a.jpg' } },
            },
          },
        },
      },
    ];
    const patch = resolveFeaturedImagePatch({ type: 'block', index: 0 }, blocks);
    expect(patch?.featured_image).toBe('img-1');
    expect(patch?.featured_image_url).toBe('https://example.com/a.jpg');
  });

  it('featuredImageSourceFromPost defaults to none without featured fields', () => {
    expect(featuredImageSourceFromPost({} as Post).type).toBe('none');
  });

  it('featuredImageSourceFromPost reads custom featured fields', () => {
    const post = {
      featured_image: 'img-2',
      featured_image_url: 'https://example.com/b.jpg',
    } as Post;
    expect(featuredImageSourceFromPost(post).type).toBe('custom');
  });

  it('previewUrlFromImageItemText reads direct urls and html img tags', () => {
    expect(previewUrlFromImageItemText('https://example.com/a.jpg')).toBe(
      'https://example.com/a.jpg',
    );
    expect(
      previewUrlFromImageItemText('<figure><img src="https://example.com/b.jpg"></figure>'),
    ).toBe('https://example.com/b.jpg');
  });

  it('featuredSourceFromArchivePicture maps archive renditions', () => {
    const source = featuredSourceFromArchivePicture({
      _id: 'pic-1',
      renditions: { viewImage: { href: 'https://example.com/pic.jpg' } },
    });
    expect(source?.picture).toBe('pic-1');
    expect(source?.picture_url).toBe('https://example.com/pic.jpg');
  });

  it('buildFeaturedImageLibraryOptions skips blog cover when blog has no picture', () => {
    const options = buildFeaturedImageLibraryOptions(
      {} as Blog,
      [],
      [{ _id: 'pic-1', renditions: { viewImage: { href: 'https://example.com/one.png' } } }],
      [],
      labels,
    );
    expect(options.map((option) => option.key)).toEqual(['archive:pic-1']);
  });

  it('buildFeaturedImageLibraryOptions includes blog cover and archive pictures', () => {
    const options = buildFeaturedImageLibraryOptions(
      { picture_url: 'https://example.com/blog.jpg' } as Blog,
      [],
      [
        { _id: 'pic-1', renditions: { viewImage: { href: 'https://example.com/one.png' } } },
        { _id: 'pic-2', renditions: { viewImage: { href: 'https://example.com/two.png' } } },
      ],
      [],
      labels,
    );
    expect(options.map((option) => option.key)).toEqual(['blog', 'archive:pic-1', 'archive:pic-2']);
    expect(filenameFromImageUrl('https://example.com/path/photo.jpg?v=1')).toBe('photo.jpg');
  });

  it('isSameFeaturedSource matches block index and custom picture id', () => {
    expect(
      isSameFeaturedSource({ type: 'block', index: 1 }, { type: 'block', index: 1 }),
    ).toBe(true);
    expect(
      isSameFeaturedSource({ type: 'block', index: 1 }, { type: 'block', index: 0 }),
    ).toBe(false);
    expect(
      isSameFeaturedSource(
        { type: 'custom', picture: 'a', picture_url: 'u1', picture_renditions: {} },
        { type: 'custom', picture: 'a', picture_url: 'u2', picture_renditions: {} },
      ),
    ).toBe(true);
  });
});
