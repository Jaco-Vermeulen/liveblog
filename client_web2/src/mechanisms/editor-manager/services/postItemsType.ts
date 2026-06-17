import type { Post, PostItem } from '@/mechanisms/liveblog-api';

const KNOWN_SOCIAL_EMBED_MARKERS = [
  'facebook',
  'twitter',
  'youtube',
  'instagram',
  'brightcove',
] as const;

export interface PostItemsTypeResult {
  postItemsType: string | null;
  postItemsIcon: string | null;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '').trim();
}

function isMeaningfulTextItem(item: PostItem): boolean {
  if (item.item_type?.toLowerCase() !== 'text') return false;
  return Boolean(stripHtml(item.text ?? ''));
}

function isEditorialItem(item: PostItem): boolean {
  const itemType = item.item_type?.toLowerCase() ?? '';
  if (itemType === 'comment' || itemType === 'embed') return false;
  if (itemType === 'text') return isMeaningfulTextItem(item);
  if (itemType.startsWith('advertisement')) return false;
  return ['image', 'quote', 'poll', 'scorecard', 'video'].includes(itemType);
}

function editorialDisplayType(item: PostItem): string {
  const itemType = item.item_type?.toLowerCase() ?? 'text';
  if (itemType === 'text' && item.meta && typeof item.meta === 'object' && 'quote' in item.meta) {
    return 'quote';
  }
  return itemType || 'text';
}

function resolveEditorialType(editorialItems: PostItem[]): string {
  const displayTypes = editorialItems.map(editorialDisplayType);
  const imageCount = displayTypes.filter((type) => type === 'image').length;

  if (imageCount > 1 && !displayTypes.includes('text') && !displayTypes.includes('poll')) {
    return 'slideshow';
  }
  if (displayTypes.includes('poll')) return 'poll';
  return displayTypes[0] ?? 'text';
}

function isKnownSocialProvider(providerName: string | undefined): boolean {
  const provider = (providerName ?? '').toLowerCase().trim();
  if (provider === 'x' || provider === 'twitter') return true;
  return KNOWN_SOCIAL_EMBED_MARKERS.some((marker) => provider.includes(marker));
}

function embedFaviconUrl(item: PostItem): string | null {
  const meta = item.meta ?? {};
  for (const key of ['provider_url', 'original_url', 'url'] as const) {
    const rawUrl = meta[key];
    if (typeof rawUrl !== 'string' || !rawUrl.trim()) continue;
    try {
      const hostname = new URL(rawUrl).hostname;
      if (hostname) {
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function getEmbedType(item: PostItem): string {
  const providerName = item.meta?.provider_name;
  if (typeof providerName === 'string' && providerName.trim()) {
    return `embed-${providerName.toLowerCase()}`;
  }
  return 'embed';
}

function resolveEmbedPostType(item: PostItem): PostItemsTypeResult {
  const providerName =
    typeof item.meta?.provider_name === 'string' ? item.meta.provider_name : undefined;
  const postItemsType = getEmbedType(item);
  if (isKnownSocialProvider(providerName)) {
    return { postItemsType, postItemsIcon: null };
  }
  const favicon = embedFaviconUrl(item);
  if (favicon) {
    return { postItemsType: 'embed', postItemsIcon: favicon };
  }
  return { postItemsType, postItemsIcon: null };
}

export function collectPostItems(post: Post): PostItem[] {
  const mainGroup = post.groups?.find((group) => group.id === 'main') ?? post.groups?.[1];
  return (mainGroup?.refs ?? [])
    .map((ref) => ref.item)
    .filter((item): item is PostItem => Boolean(item));
}

/** Mirrors server `calculate_post_type` for preview badges (tree / social / favicon). */
export function calculatePostItemsType(
  post: Post | { items?: Array<{ item: PostItem }> },
  items?: PostItem[],
): PostItemsTypeResult {
  const resolvedItems =
    items ??
    ('items' in post && post.items?.length
      ? post.items.map((entry) => entry.item)
      : collectPostItems(post as Post));

  if (resolvedItems.length === 0) {
    return { postItemsType: null, postItemsIcon: null };
  }

  if (resolvedItems.some((item) => item.item_type?.toLowerCase().startsWith('advertisement'))) {
    return { postItemsType: 'advertisement', postItemsIcon: null };
  }

  if (resolvedItems.length === 1) {
    const item = resolvedItems[0]!;
    const itemType = item.item_type?.toLowerCase() ?? '';
    if (itemType === 'embed') return resolveEmbedPostType(item);
    if (itemType === 'poll') return { postItemsType: 'poll', postItemsIcon: null };
    return { postItemsType: editorialDisplayType(item), postItemsIcon: null };
  }

  const editorialItems = resolvedItems.filter(isEditorialItem);
  if (editorialItems.length > 0) {
    return {
      postItemsType: resolveEditorialType(editorialItems),
      postItemsIcon: null,
    };
  }

  const imageCount = resolvedItems.filter((item) => item.item_type === 'image').length;
  if (imageCount > 1) {
    return { postItemsType: 'slideshow', postItemsIcon: null };
  }

  return { postItemsType: null, postItemsIcon: null };
}

export function resolvePostBadge(
  post: Post,
  previewItems?: PostItem[],
): PostItemsTypeResult {
  if (post.post_items_type) {
    return {
      postItemsType: post.post_items_type,
      postItemsIcon: post.post_items_icon ?? null,
    };
  }
  return calculatePostItemsType(post, previewItems);
}
