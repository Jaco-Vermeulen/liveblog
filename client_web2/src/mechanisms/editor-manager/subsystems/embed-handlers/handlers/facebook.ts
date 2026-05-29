import { getEmbedEditorConfig } from '../services/embedEditorConfig';
import { fetchOembed } from '../services/iframely';
import { createHandler } from './types';

const PATTERNS = [/https?:\/\/(www\.)?facebook\.com\/.*/i];

export const facebookHandler = createHandler('Facebook', PATTERNS, async (url, maxWidth) => {
  const { coverMaxWidth, facebookAppId } = getEmbedEditorConfig();
  const width = maxWidth ?? coverMaxWidth;
  const response = await fetchOembed(url);
  const data = { ...response };

  // Store clean oEmbed HTML — timeline/preview activate via theme loadEmbeds + iframely.load().
  // Do not inject parse scripts or strip fb-root (public theme provides #fb-root).
  if (data.provider_name === 'Facebook' && data.html && width !== undefined) {
    let html = data.html.replace('class="fb-post"', `class="fb-post" data-width="${width}"`);
    if (facebookAppId) {
      html = html.replace('js#xfbml=1', `js#xfbml=1&status=0&appId=${facebookAppId}`);
    }
    data.html = html;
  }

  return {
    ...data,
    original_url: url,
    url: data.url ?? url,
    provider_name: data.provider_name ?? 'Facebook',
  };
});
