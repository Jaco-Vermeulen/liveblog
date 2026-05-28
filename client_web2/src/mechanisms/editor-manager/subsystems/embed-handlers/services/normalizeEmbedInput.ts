/**
 * Port of `sir-trevor-blocks/embed-block.js` input normalization (URL vs embed code).
 */

const URI_REGEX =
  /^(https?:)?\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&/+#-]*[\w@?^=%&/#-])?/i;

const SOCIAL_EMBED_REGEX =
  /(iframe|blockquote)+[\s\S]*(youtube-nocookie\.com\/embed|youtube\.com\/embed|facebook\.com\/plugins|instagram\.com\/p\/|players\.brightcove\.net|twitter\.com\/.*\/status)[\s\S]*(iframe|blockquote)/i;

const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/|youtube-nocookie\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))(\w+)/i;

const FACEBOOK_REGEX = /(?:post\.php|video\.php)\?href=(https?[\w%.]+)/i;

const INSTAGRAM_REGEX = /(https?:\/\/(?:www)?\.?instagram\.com\/p\/(?:\w+.)+\/)/i;

const TWITTER_REGEX = /(https?:\/\/(?:www|mobile)?\.?twitter\.com\/\w+\/status\/\d+)/i;

const BRIGHTCOVE_REGEX =
  /(https?:\/\/players\.brightcove\.net\/\d*\/[a-zA-Z\d_-]*\/index\.html\?videoId=\d*)/i;

export function isHttpUri(value: string): boolean {
  return URI_REGEX.test(value.trim());
}

export function fixSecureEmbedUrl(value: string): string {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    const match = value.match(URI_REGEX);
    if (match?.[1] === 'http:') {
      return match[0];
    }
  }
  return value.replace('cnn.com/video/api/embed.html#/video', 'cnn.com/videos');
}

export function cleanupTwitterUrl(value: string): string {
  const match = TWITTER_REGEX.exec(value);
  return match?.[1] ?? value;
}

export function replaceEmbedCodeWithUrl(input: string): string {
  const trimmed = input.trim();
  if (!SOCIAL_EMBED_REGEX.test(trimmed)) {
    return trimmed;
  }

  const youtube = YOUTUBE_REGEX.exec(trimmed);
  if (youtube) {
    return `https://www.youtube.com/watch?v=${youtube[1]}`;
  }

  const facebook = FACEBOOK_REGEX.exec(trimmed);
  if (facebook) {
    return decodeURIComponent(facebook[1]);
  }

  const instagram = INSTAGRAM_REGEX.exec(trimmed);
  if (instagram) {
    return instagram[1];
  }

  const twitter = TWITTER_REGEX.exec(trimmed);
  if (twitter) {
    return twitter[1];
  }

  const brightcove = BRIGHTCOVE_REGEX.exec(trimmed);
  if (brightcove) {
    return brightcove[0];
  }

  return trimmed;
}

import { looksLikeEmbedCode } from './normalizeEmbedUrl';

/** True when input is worth auto-resolving (legacy: paste debounce + Enter). */
export function shouldAutoResolveInput(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (looksLikeEmbedCode(trimmed)) return true;
  return isHttpUri(normalizeEmbedInput(trimmed));
}

/** Debounce before auto-resolve — shorter when input already looks complete. */
export function autoResolveDelayMs(raw: string): number {
  return shouldAutoResolveInput(raw) ? 200 : 400;
}

/** Normalize pasted URL or embed HTML before oEmbed (legacy embed block). */
export function normalizeEmbedInput(raw: string): string {
  let value = raw.trim();
  if (!value) return value;

  value = replaceEmbedCodeWithUrl(value);
  value = fixSecureEmbedUrl(value);

  if (isHttpUri(value)) {
    value = cleanupTwitterUrl(value);
  }

  return value;
}
