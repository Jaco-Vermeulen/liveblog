import { fetchOembed } from '../services/iframely';
import { createHandler } from './types';

const PATTERNS = [/(?:https?:\/\/)?(?:www\.)?(?:instagr(?:\.am|am\.com))\/p\/.+/i];

export const instagramHandler = createHandler('Instagram', PATTERNS, async (url) => {
  const data = await fetchOembed(url);
  return {
    ...data,
    original_url: url,
    url: data.url ?? url,
    provider_name: data.provider_name ?? 'Instagram',
  };
});
