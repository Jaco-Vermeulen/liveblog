import { AF } from '@/copy';

export type EmbedProviderId =
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'picture'
  | 'generic';

export interface EmbedProviderMatch {
  id: EmbedProviderId;
  label: string;
}

const E = AF.editor.embed.providers;

const PROVIDERS: Array<{ id: EmbedProviderId; label: string; patterns: RegExp[] }> = [
  {
    id: 'twitter',
    label: E.twitter,
    patterns: [
      /https?:\/\/(?:www|mobile\.)?twitter\.com\/(?:#!\/)?[^/]+\/status(?:es)?\/\d+/i,
      /https?:\/\/t\.co\/[a-zA-Z0-9]+/i,
    ],
  },
  {
    id: 'facebook',
    label: E.facebook,
    patterns: [/https?:\/\/(www\.)?facebook\.com\/.*/i],
  },
  {
    id: 'instagram',
    label: E.instagram,
    patterns: [/(?:https?:\/\/)?(?:www\.)?(?:instagr(?:\.am|am\.com))\/p\/.+/i],
  },
  {
    id: 'picture',
    label: E.picture,
    patterns: [
      /(?:[^:/?#]+:)?(?:\/\/([^/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i,
    ],
  },
];

export function detectEmbedProvider(url: string): EmbedProviderMatch {
  const trimmed = url.trim();
  if (!trimmed) {
    return { id: 'generic', label: E.generic };
  }

  for (const provider of PROVIDERS) {
    if (provider.patterns.some((pattern) => pattern.test(trimmed))) {
      return { id: provider.id, label: provider.label };
    }
  }

  try {
    const hostname = new URL(trimmed).hostname.replace(/^www\./, '');
    const label = hostname.split('.')[0];
    return { id: 'generic', label: label.charAt(0).toUpperCase() + label.slice(1) };
  } catch {
    return { id: 'generic', label: E.generic };
  }
}
