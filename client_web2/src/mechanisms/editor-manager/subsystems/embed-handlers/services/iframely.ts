import type { OembedResponse } from '../types';
import { loggedFetch } from './loggedFetch';
import { normalizeEmbedUrl } from './normalizeEmbedUrl';

/** Same public key as legacy `iframely-public-key.js` / webpack config. */
export const IFRAMELY_PUBLIC_KEY = 'a5ee9a89addd13b7a2e3a48c23e74e8d';

/** MD5 public key — `key=` on oEmbed and embed.js (NOT raw api_key). */
export function getIframelyKey(): string {
  const fromEnv = import.meta.env.VITE_IFRAMELY_KEY as string | undefined;
  return fromEnv?.trim() || IFRAMELY_PUBLIC_KEY;
}

export class IframelyError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'IframelyError';
  }
}

/**
 * Iframely oEmbed — must use `key=` not `api_key=` (iframe.ly/docs/allow-origins).
 */
export async function fetchOembed(url: string): Promise<OembedResponse> {
  const targetUrl = normalizeEmbedUrl(url);
  const params = new URLSearchParams({
    key: getIframelyKey(),
    url: targetUrl,
    /** Prefer iframe-based embed HTML where available (YouTube, etc.). */
    iframe: '1',
  });
  const requestUrl = `https://iframe.ly/api/oembed?${params.toString()}`;

  const response = await loggedFetch(requestUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  let body: OembedResponse;
  try {
    body = (await response.json()) as OembedResponse;
  } catch {
    throw new IframelyError('Invalid Iframely response', response.status);
  }

  if (!response.ok) {
    const message =
      body.error_message ??
      body.data?.error_message ??
      `Iframely request failed (${response.status})`;
    throw new IframelyError(message, response.status);
  }

  return body;
}
