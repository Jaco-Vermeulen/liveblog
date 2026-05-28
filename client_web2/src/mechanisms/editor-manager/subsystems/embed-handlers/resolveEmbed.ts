import { facebookHandler } from './handlers/facebook';
import { instagramHandler } from './handlers/instagram';
import { pictureHandler } from './handlers/picture';
import type { EmbedHandler } from './handlers/types';
import { twitterHandler } from './handlers/twitter';
import { guessProvider } from './services/guessProvider';
import { fetchOembed, IframelyError } from './services/iframely';
import { getEmbedEditorConfig } from './services/embedEditorConfig';
import { isHttpUri, normalizeEmbedInput } from './services/normalizeEmbedInput';
import { fixEmbedHtml } from './services/mergeEmbedMeta';
import { isHttpUrl, looksLikeEmbedCode, normalizeEmbedUrl } from './services/normalizeEmbedUrl';
import type { EmbedMeta, EmbedResolveOptions, OembedResponse } from './types';

const HANDLERS: EmbedHandler[] = [
  twitterHandler,
  facebookHandler,
  instagramHandler,
  pictureHandler,
];

export { IframelyError };

function applyProviderFallback(data: EmbedMeta, originalUrl: string): EmbedMeta {
  const next = { ...data };
  const targetUrl = next.url ?? originalUrl;

  if (!next.provider_name || !next.provider_url) {
    const guessed = guessProvider(targetUrl);
    if (!next.provider_name) next.provider_name = guessed.name;
    if (!next.provider_url) next.provider_url = guessed.url;
  }

  next.original_url = next.original_url ?? originalUrl;
  next.url = next.url ?? originalUrl;
  next.liveblog_version = next.liveblog_version ?? '3.4';

  return next;
}

function oembedToMeta(data: OembedResponse, originalUrl: string): EmbedMeta {
  return applyProviderFallback(
    {
      ...data,
      original_url: originalUrl,
      url: data.url ?? originalUrl,
    },
    originalUrl,
  );
}

/**
 * Resolve a URL or raw embed HTML to full item meta (legacy embedService + Iframely).
 */
export async function resolveEmbed(
  input: string,
  options: EmbedResolveOptions = {},
): Promise<EmbedMeta> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('URL or embed code is required');
  }

  const { coverMaxWidth } = getEmbedEditorConfig();
  const maxWidth = options.maxWidth ?? coverMaxWidth;
  const normalized = normalizeEmbedInput(trimmed);

  if (looksLikeEmbedCode(normalized) && !isHttpUrl(normalized) && !isHttpUri(normalized)) {
    return fixEmbedHtml(
      applyProviderFallback(
        {
          html: normalized,
          provider_name: 'Embed',
          original_url: '',
        },
        '',
      ),
    );
  }

  const url = normalizeEmbedUrl(normalized);
  if (!isHttpUrl(url)) {
    throw new Error('Enter a valid http(s) URL or embed HTML');
  }

  for (const handler of HANDLERS) {
    if (handler.matches(url)) {
      const meta = await handler.embed(url, maxWidth);
      return fixEmbedHtml(applyProviderFallback(meta, url));
    }
  }

  const data = await fetchOembed(url);
  return fixEmbedHtml(oembedToMeta(data, url));
}
