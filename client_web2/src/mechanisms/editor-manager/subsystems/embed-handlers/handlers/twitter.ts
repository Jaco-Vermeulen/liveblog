import { fetchOembed } from '../services/iframely';
import { createHandler } from './types';

const PATTERNS = [
  /https?:\/\/(?:www|mobile\.)?twitter\.com\/(?:#!\/)?[^/]+\/status(?:es)?\/\d+/i,
  /https?:\/\/t\.co\/[a-zA-Z0-9]+/i,
];

/** Use Iframely HTML + embed.js (script tags in innerHTML do not run). */
export const twitterHandler = createHandler('Twitter', PATTERNS, async (url) => {
  const data = await fetchOembed(url);
  return {
    ...data,
    provider_name: data.provider_name ?? 'Twitter',
    original_url: url,
    url: data.url ?? url,
  };
});
