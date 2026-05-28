import type { Freetype, PollBody, Post, PostItem } from '@/mechanisms/liveblog-api';
import { extractFreetypeFields, getPathValue } from '@/mechanisms/freetypes-manager';
import type { EmbedMeta } from '../subsystems/embed-handlers';
import { metaForSave } from '../subsystems/embed-handlers/services/mergeEmbedMeta';
import { isRichTextHtml, normalizeRichTextHtml } from '../subsystems/rich-text-editor';
import type { SirTrevorBlock } from '../types';

function blockTextValue(raw: unknown): string {
  const s = String(raw ?? '');
  return isRichTextHtml(s) ? normalizeRichTextHtml(s) : s.trim();
}

export function blocksToPostItems(blocks: SirTrevorBlock[]): PostItem[] {
  return blocks
    .map((block) => blockToPostItem(block))
    .filter((item): item is PostItem => item !== null);
}

/** True when the block would not produce a post item (unused / blank). */
export function isBlockEmpty(block: SirTrevorBlock): boolean {
  return blockToPostItem(block) === null;
}

function blockToPostItem(block: SirTrevorBlock): PostItem | null {
  switch (block.type) {
    case 'Text': {
      const text = blockTextValue(block.data.text);
      if (!text) return null;
      return {
        item_type: 'text',
        text,
        group_type: 'default',
        meta: block.data.meta as Record<string, unknown> | undefined,
      };
    }
    case 'Embed': {
      const url = String(block.data.url ?? block.data.uri ?? '').trim();
      const embedMeta = block.data.embedMeta as EmbedMeta | undefined;
      const legacyMeta = block.data.meta as EmbedMeta | undefined;
      const merged: EmbedMeta = {
        ...legacyMeta,
        ...embedMeta,
        url: embedMeta?.url ?? legacyMeta?.url ?? url,
        original_url: embedMeta?.original_url ?? legacyMeta?.original_url ?? url,
      };
      const meta = metaForSave(merged);
      if (!url && !meta.html) return null;
      return {
        item_type: 'embed',
        group_type: 'default',
        text: meta.html ?? url,
        meta,
      };
    }
    case 'Quote': {
      const text = blockTextValue(block.data.text);
      if (!text) return null;
      return { item_type: 'text', text, meta: { quote: true, ...((block.data.meta as object) ?? {}) } };
    }
    case 'Poll': {
      const pollBody = block.data.pollBody as PollBody | undefined;
      if (!pollBody?.question) return null;
      return {
        item_type: 'poll',
        poll_body: pollBody,
        id_to_update: block.data.pollId as string | undefined,
      };
    }
    case 'Image': {
      const url = String(block.data.url ?? block.data.picture_url ?? '').trim();
      if (!url) return null;
      return {
        item_type: 'image',
        text: url,
        group_type: 'default',
        meta: block.data.meta as Record<string, unknown> | undefined,
      };
    }
    default:
      return null;
  }
}

export function postToBlocks(post: { mainItem?: { item: PostItem }; items?: Array<{ item: PostItem }> }): SirTrevorBlock[] {
  const entries = post.items?.length
    ? post.items.map((r) => r.item)
    : post.mainItem?.item
      ? [post.mainItem.item]
      : [];

  return entries
    .map((item) => itemToBlock(item))
    .filter((b): b is SirTrevorBlock => b !== null);
}

export function freetypeHasContent(
  template: string,
  data: Record<string, unknown>,
): boolean {
  const fields = extractFreetypeFields(template);
  if (!fields.length) return false;
  return fields.some((field) => {
    const path = field.type === 'image' ? `${field.path}.picture_url` : field.path;
    const value = getPathValue(data, path);
    return value != null && String(value).trim() !== '';
  });
}

export function loadFreetypeFromPost(
  post: Post,
  freetypes: Freetype[],
): { freetype: Freetype; data: Record<string, unknown> } | null {
  const item = post.mainItem?.item ?? post.items?.[0]?.item;
  if (!item || item.group_type !== 'freetype') return null;
  const freetype = freetypes.find((ft) => ft.name === item.item_type);
  if (!freetype) return null;
  const data =
    item.meta && typeof item.meta === 'object' && 'data' in item.meta
      ? (item.meta.data as Record<string, unknown>)
      : {};
  return { freetype, data };
}

function itemToBlock(item: PostItem): SirTrevorBlock | null {
  if (item.group_type === 'freetype') {
    return null;
  }
  if (item.item_type === 'embed') {
    const meta = (item.meta ?? {}) as EmbedMeta;
    return {
      type: 'Embed',
      data: {
        url: meta.original_url ?? meta.url ?? item.text ?? '',
        embedMeta: meta,
        meta,
      },
    };
  }
  if (item.item_type === 'image') {
    return {
      type: 'Image',
      data: {
        url: item.text ?? '',
        meta: item.meta,
      },
    };
  }
  if (item.item_type === 'poll' && item.poll_body) {
    return {
      type: 'Poll',
      data: {
        pollBody: item.poll_body,
        pollId: item._id ?? item.id_to_update,
      },
    };
  }
  if (item.item_type === 'text' || !item.item_type) {
    return { type: 'Text', data: { text: item.text ?? '', meta: item.meta } };
  }
  return null;
}
