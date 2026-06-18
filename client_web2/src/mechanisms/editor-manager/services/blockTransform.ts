import type { Freetype, PollBody, Post, PostItem } from '@/mechanisms/liveblog-api';
import { SCORECARD_FREETYPE_NAME } from '@/mechanisms/freetypes-manager/builtinFreetypes';
import { extractFreetypeFields, getPathValue } from '@/mechanisms/freetypes-manager';
import {
  freetypeDataToScorecardBody,
  isScorecardBodyEmpty,
  normalizeScorecardBody,
  scorecardBodyToPostItem,
  type ScorecardBody,
} from '../subsystems/scorecard';
import type { EmbedMeta } from '../subsystems/embed-handlers';
import { metaForSave } from '../subsystems/embed-handlers/services/mergeEmbedMeta';
import { isRichTextHtml, normalizeRichTextHtml } from '../subsystems/rich-text-editor';
import type { SirTrevorBlock } from '../types';

function blockTextValue(raw: unknown): string {
  const s = String(raw ?? '');
  return isRichTextHtml(s) ? normalizeRichTextHtml(s) : s.trim();
}

function buildSyntheticMedia(url: string): Record<string, unknown> {
  const fallbackRendition = { href: url, width: 1, height: 1 };
  return {
    renditions: {
      thumbnail: fallbackRendition,
      viewImage: fallbackRendition,
      baseImage: fallbackRendition,
      original: fallbackRendition,
    },
  };
}

export function blocksToPostItems(blocks: SirTrevorBlock[]): PostItem[] {
  const scorecardBlock = blocks.find((b) => b.type === 'Scorecard');
  if (scorecardBlock) {
    const body = normalizeScorecardBody(scorecardBlock.data.scorecardBody);
    if (!isScorecardBodyEmpty(body)) {
      return [scorecardBodyToPostItem(body)];
    }
  }
  return blocks
    .filter((b) => b.type !== 'Scorecard')
    .map((block) => blockToPostItem(block))
    .filter((item): item is PostItem => item !== null);
}

function isPollBlockEmpty(block: SirTrevorBlock): boolean {
  const pollBody = block.data.pollBody as PollBody | undefined;
  if (!pollBody) return true;
  const hasQuestion = Boolean(pollBody.question?.trim());
  const hasAnswers = (pollBody.answers ?? []).some((a) => a.option?.trim());
  const hasDuration = Boolean(pollBody.active_until?.trim());
  return !hasQuestion && !hasAnswers && !hasDuration;
}

/** True when the block would not produce a post item (unused / blank). */
export function isBlockEmpty(block: SirTrevorBlock): boolean {
  if (block.type === 'Poll') {
    return isPollBlockEmpty(block);
  }
  if (block.type === 'Scorecard') {
    return isScorecardBodyEmpty(normalizeScorecardBody(block.data.scorecardBody));
  }
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
    case 'Scorecard': {
      const body = normalizeScorecardBody(block.data.scorecardBody);
      if (isScorecardBodyEmpty(body)) return null;
      return scorecardBodyToPostItem(body);
    }
    case 'Poll': {
      const pollBody = block.data.pollBody as PollBody | undefined;
      const question = pollBody?.question?.trim() ?? '';
      const answers = pollBody?.answers ?? [];
      const activeUntil = pollBody?.active_until?.trim() ?? '';
      if (!question || answers.length < 2) return null;
      if (!answers.every((a) => a.option?.trim())) return null;
      if (!activeUntil) return null;
      return {
        item_type: 'poll',
        poll_body: {
          question,
          answers: answers.map((a) => ({ option: a.option.trim(), votes: a.votes ?? 0 })),
          active_until: activeUntil,
        },
        id_to_update: block.data.pollId as string | undefined,
      };
    }
    case 'Image': {
      const media = (block.data.media as Record<string, unknown> | undefined) ?? undefined;
      const renditions =
        media && typeof media === 'object' && 'renditions' in media
          ? (media.renditions as Record<string, { href?: string }>)
          : undefined;
      const renditionUrl =
        renditions?.viewImage?.href ??
        renditions?.baseImage?.href ??
        renditions?.thumbnail?.href;
      const url = String(block.data.url ?? block.data.picture_url ?? renditionUrl ?? '').trim();
      if (!url) return null;
      const resolvedMedia = media ?? buildSyntheticMedia(url);
      const meta = {
        ...((block.data.meta as Record<string, unknown> | undefined) ?? {}),
        media: resolvedMedia,
      };
      return {
        item_type: 'image',
        text: url,
        group_type: 'default',
        meta,
      };
    }
    default:
      return null;
  }
}

export function postToBlocks(post: Post): SirTrevorBlock[] {
  return collectPostItems(post)
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

export function collectPostItems(post: Post): PostItem[] {
  const fromFlat = post.items?.map((row) => row.item).filter(Boolean) as PostItem[] | undefined;
  if (fromFlat?.length) return fromFlat;

  const fromMain = post.mainItem?.item ? [post.mainItem.item] : [];
  if (fromMain.length) return fromMain;

  const fromGroups: PostItem[] = [];
  for (const group of post.groups ?? []) {
    for (const ref of group.refs ?? []) {
      if (ref.item) fromGroups.push(ref.item);
    }
  }
  return fromGroups;
}

function findScorecardItem(post: Post): PostItem | null {
  const match = collectPostItems(post).find((item) => item.item_type === SCORECARD_FREETYPE_NAME);
  return match ?? null;
}

export function loadFreetypeFromPost(
  post: Post,
  freetypes: Freetype[],
): { freetype: Freetype; data: Record<string, unknown> } | null {
  const item = collectPostItems(post).find((entry) => entry.group_type === 'freetype');
  if (!item || item.group_type !== 'freetype') return null;
  if (item.item_type === SCORECARD_FREETYPE_NAME) return null;
  const freetype = freetypes.find((ft) => ft.name === item.item_type);
  if (!freetype) return null;
  const data =
    item.meta && typeof item.meta === 'object' && 'data' in item.meta
      ? (item.meta.data as Record<string, unknown>)
      : {};
  return { freetype, data };
}

export function loadScorecardFromPost(post: Post): ScorecardBody | null {
  const block = postToBlocks(post).find((b) => b.type === 'Scorecard');
  if (block?.data.scorecardBody) {
    return normalizeScorecardBody(block.data.scorecardBody);
  }

  const item = findScorecardItem(post);
  if (!item) return null;

  const data =
    item.meta && typeof item.meta === 'object' && 'data' in item.meta
      ? (item.meta.data as Record<string, unknown>)
      : {};
  return freetypeDataToScorecardBody(data);
}

function itemToBlock(item: PostItem): SirTrevorBlock | null {
  if (item.group_type === 'freetype') {
    if (item.item_type === SCORECARD_FREETYPE_NAME) {
      const data =
        item.meta && typeof item.meta === 'object' && 'data' in item.meta
          ? (item.meta.data as Record<string, unknown>)
          : {};
      return {
        type: 'Scorecard',
        data: { scorecardBody: freetypeDataToScorecardBody(data) },
      };
    }
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
    const media =
      item.meta && typeof item.meta === 'object' && 'media' in item.meta
        ? (item.meta.media as Record<string, unknown>)
        : undefined;
    const renditions =
      media && typeof media === 'object' && 'renditions' in media
        ? (media.renditions as Record<string, { href?: string }>)
        : undefined;
    const fallbackUrl =
      renditions?.viewImage?.href ??
      renditions?.baseImage?.href ??
      renditions?.thumbnail?.href ??
      item.text ??
      '';
    return {
      type: 'Image',
      data: {
        url: fallbackUrl,
        media,
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
