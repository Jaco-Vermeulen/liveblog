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

const PROVIDERS: Array<{ id: EmbedProviderId; label: string; patterns: RegExp[] }> = [
  {
    id: 'twitter',
    label: 'Twitter',
    patterns: [
      /https?:\/\/(?:www|mobile\.)?twitter\.com\/(?:#!\/)?[^/]+\/status(?:es)?\/\d+/i,
      /https?:\/\/t\.co\/[a-zA-Z0-9]+/i,
    ],
  },
  {
    id: 'facebook',
    label: 'Facebook',
    patterns: [/https?:\/\/(www\.)?facebook\.com\/.*/i],
  },
  {
    id: 'instagram',
    label: 'Instagram',
    patterns: [/(?:https?:\/\/)?(?:www\.)?(?:instagr(?:\.am|am\.com))\/p\/.+/i],
  },
  {
    id: 'picture',
    label: 'Picture',
    patterns: [
      /(?:[^:/?#]+:)?(?:\/\/([^/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i,
    ],
  },
];

export function detectEmbedProvider(url: string): EmbedProviderMatch {
  const trimmed = url.trim();
  if (!trimmed) {
    return { id: 'generic', label: 'Embed' };
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
    return { id: 'generic', label: 'Embed' };
  }
}
