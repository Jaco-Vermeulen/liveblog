import { fetchOembed } from '../services/iframely';
import { createHandler } from './types';

const PATTERNS = [
  /(?:[^:/?#]+:)?(?:\/\/([^/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i,
];

export const pictureHandler = createHandler('Picture', PATTERNS, async (url) => {
  const data = await fetchOembed(url);

  if (data.type === 'photo' && !data.thumbnail_url) {
    return {
      ...data,
      thumbnail_url: data.url,
      original_url: url,
      url: data.url ?? url,
      provider_name: data.provider_name ?? 'Picture',
    };
  }

  return {
    ...data,
    original_url: url,
    url: data.url ?? url,
    provider_name: data.provider_name ?? 'Picture',
  };
});
