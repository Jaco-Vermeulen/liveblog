import type { ArchivePicture, BlogImageItem, Blog, Post } from '@/mechanisms/liveblog-api';
import type { SirTrevorBlock } from '../types';
export type FeaturedImageSource =
  | { type: 'none' }
  | { type: 'blog' }
  | { type: 'block'; index: number }
  | {
      type: 'custom';
      picture: string;
      picture_url: string;
      picture_renditions: Record<string, { href?: string; width?: number; height?: number }>;
    };

export function featuredImageSourceFromPost(post: Post | null): FeaturedImageSource {
  if (post?.featured_image_url || post?.featured_image) {
    return {
      type: 'custom',
      picture: post.featured_image ?? '',
      picture_url: post.featured_image_url ?? '',
      picture_renditions: (post.featured_image_renditions ?? {}) as Record<
        string,
        { href?: string; width?: number; height?: number }
      >,
    };
  }
  return { type: 'none' };
}

export function previewUrlForFeaturedSource(
  source: FeaturedImageSource,
  blocks: SirTrevorBlock[],
  blog?: Blog | null,
): string {
  if (source.type === 'custom') {
    return source.picture_url;
  }
  if (source.type === 'block') {
    const block = blocks[source.index];
    if (!block || block.type !== 'Image') return '';
    return String(block.data.picture_url ?? block.data.url ?? '');
  }
  return blog?.picture_url ?? '';
}

function mediaFromImageBlock(block: SirTrevorBlock) {
  const meta = (block.data.meta as Record<string, unknown> | undefined) ?? {};
  const media = (meta.media as Record<string, unknown> | undefined) ?? block.data.media;
  if (!media || typeof media !== 'object') return null;
  const record = media as {
    _id?: string;
    renditions?: Record<string, { href?: string; width?: number; height?: number }>;
  };
  const renditions = record.renditions ?? {};
  const pictureUrl =
    String(block.data.picture_url ?? block.data.url ?? renditions.viewImage?.href ?? '');
  if (!pictureUrl && !record._id) return null;
  return {
    picture: record._id ?? '',
    picture_url: pictureUrl,
    picture_renditions: renditions,
  };
}

export function resolveFeaturedImagePatch(
  source: FeaturedImageSource,
  blocks: SirTrevorBlock[],
): Pick<Post, 'featured_image' | 'featured_image_url' | 'featured_image_renditions'> | null {
  if (source.type === 'none') {
    return {
      featured_image: null as unknown as string,
      featured_image_url: null as unknown as string,
      featured_image_renditions: null as unknown as Post['featured_image_renditions'],
    };
  }
  if (source.type === 'blog') {
    return {
      featured_image: null as unknown as string,
      featured_image_url: null as unknown as string,
      featured_image_renditions: null as unknown as Post['featured_image_renditions'],
    };
  }
  if (source.type === 'custom') {
    return {
      featured_image: source.picture || undefined,
      featured_image_url: source.picture_url,
      featured_image_renditions: source.picture_renditions,
    };
  }
  const block = blocks[source.index];
  if (!block || block.type !== 'Image') return null;
  const media = mediaFromImageBlock(block);
  if (!media) return null;
  return {
    featured_image: media.picture || undefined,
    featured_image_url: media.picture_url,
    featured_image_renditions: media.picture_renditions,
  };
}

export function listImageBlockOptions(blocks: SirTrevorBlock[]) {
  return blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type === 'Image')
    .map(({ block, index }) => ({
      index,
      label: String(block.data.picture_url ?? block.data.url ?? `Beeld ${index + 1}`),
      url: String(block.data.picture_url ?? block.data.url ?? ''),
    }));
}

export type FeaturedImageOption = {
  key: string;
  url: string;
  label: string;
  source: FeaturedImageSource;
};

export function previewUrlFromImageItemText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  return match?.[1] ?? '';
}

export function filenameFromImageUrl(url: string): string {
  if (!url) return '';
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split('/').pop() ?? '');
  } catch {
    return url.split('/').pop()?.split('?')[0] ?? '';
  }
}

export function featuredSourceFromArchivePicture(
  picture: Pick<ArchivePicture, '_id' | 'renditions'>,
): FeaturedImageSource | null {
  const renditions = picture.renditions ?? {};
  const pictureUrl =
    renditions.viewImage?.href ?? renditions.thumbnail?.href ?? renditions.baseImage?.href ?? '';
  if (!pictureUrl) return null;
  return {
    type: 'custom',
    picture: picture._id,
    picture_url: pictureUrl,
    picture_renditions: renditions,
  };
}

export function featuredSourceFromBlogImageItem(item: BlogImageItem): FeaturedImageSource | null {
  const media = item.meta?.media;
  const textUrl = previewUrlFromImageItemText(item.text ?? '');
  const mediaUrl =
    media?.renditions?.viewImage?.href ??
    media?.renditions?.thumbnail?.href ??
    media?.renditions?.baseImage?.href ??
    '';
  const pictureUrl = textUrl || mediaUrl;
  if (!pictureUrl) return null;
  return {
    type: 'custom',
    picture: media?._id ?? item._id,
    picture_url: pictureUrl,
    picture_renditions: media?.renditions ?? {},
  };
}

export function buildFeaturedImageLibraryOptions(
  blog: Blog,
  blocks: SirTrevorBlock[],
  archivePictures: ArchivePicture[],
  blogImageItems: BlogImageItem[],
  labels: {
    blogImage: string;
    blogImageMissing: string;
    postImage: (n: number) => string;
    libraryImage: (name: string) => string;
  },
): FeaturedImageOption[] {
  const options: FeaturedImageOption[] = [];
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();

  const addOption = (option: FeaturedImageOption) => {
    if (option.source.type !== 'blog' && !option.url) return;

    if (option.source.type === 'blog') {
      if (seenIds.has('blog')) return;
      seenIds.add('blog');
      options.push(option);
      return;
    }

    const id =
      option.source.type === 'custom' && option.source.picture ? option.source.picture : option.key;
    if (seenIds.has(id) || seenUrls.has(option.url)) return;
    seenIds.add(id);
    seenUrls.add(option.url);
    options.push(option);
  };

  if (blog.picture_url?.trim()) {
    addOption({
      key: 'blog',
      url: blog.picture_url,
      label: labels.blogImage,
      source: { type: 'blog' },
    });
  }

  for (const picture of [...archivePictures].sort((a, b) =>
    String(b._updated ?? '').localeCompare(String(a._updated ?? '')),
  )) {
    const source = featuredSourceFromArchivePicture(picture);
    if (!source) continue;
    const name = picture.unique_name?.trim() || filenameFromImageUrl(source.picture_url) || 'Beeld';
    addOption({
      key: `archive:${picture._id}`,
      url: source.picture_url,
      label: labels.libraryImage(name),
      source,
    });
  }

  for (const item of blogImageItems) {
    const source = featuredSourceFromBlogImageItem(item);
    if (!source) continue;
    const name = filenameFromImageUrl(source.picture_url) || 'Beeld';
    addOption({
      key: `item:${item._id}`,
      url: source.picture_url,
      label: labels.libraryImage(name),
      source,
    });
  }

  for (const { index, url } of listImageBlockOptions(blocks)) {
    if (!url || seenUrls.has(url)) continue;
    addOption({
      key: `block:${index}`,
      url,
      label: labels.postImage(index + 1),
      source: { type: 'block', index },
    });
  }

  return options;
}

export function isSameFeaturedSource(
  a: FeaturedImageSource,
  b: FeaturedImageSource,
): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'none' || a.type === 'blog') return b.type === a.type;
  if (a.type === 'block') return b.type === 'block' && a.index === b.index;
  if (a.type === 'custom' && b.type === 'custom') {
    if (a.picture && b.picture) return a.picture === b.picture;
    return a.picture_url === b.picture_url;
  }
  return false;
}

export function labelForFeaturedSource(
  source: FeaturedImageSource,
  blog: Blog,
  options: FeaturedImageOption[],
  labels: {
    none: string;
    blogImage: string;
    blogImageMissing: string;
    postImage: (n: number) => string;
    customUpload: string;
  },
): string {
  const match = options.find((option) => isSameFeaturedSource(option.source, source));
  if (match) return match.label;
  if (source.type === 'none') {
    return labels.none;
  }
  if (source.type === 'blog') {
    return blog.picture_url ? labels.blogImage : labels.blogImageMissing;
  }
  if (source.type === 'block') {
    return labels.postImage(source.index + 1);
  }
  return labels.customUpload;
}
