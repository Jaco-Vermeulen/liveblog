import { getEmbedEditorConfig } from '../services/embedEditorConfig';
import { fetchOembed } from '../services/iframely';
import { createHandler } from './types';

const PATTERNS = [/https?:\/\/(www\.)?facebook\.com\/.*/i];

export const facebookHandler = createHandler('Facebook', PATTERNS, async (url, maxWidth) => {
  const { coverMaxWidth, facebookAppId } = getEmbedEditorConfig();
  const width = maxWidth ?? coverMaxWidth;
  const response = await fetchOembed(url);
  const data = { ...response };

  if (data.provider_name === 'Facebook' && data.html && width !== undefined) {
    const uniqueId = `_${Math.random().toString(36).slice(2, 11)}`;
    let html = data.html.replace('class="fb-post"', `class="fb-post" data-width="${width}"`);
    if (facebookAppId) {
      html = html.replace('js#xfbml=1', `js#xfbml=1&status=0&appId=${facebookAppId}`);
    }
    html = html.replace('<div id="fb-root"></div>', '');
    html = html.replace('</script>', `</script><div id="${uniqueId}">`);
    html += '</div>';
    html += [
      '<script>',
      `  if(window.FB !== undefined) {`,
      `    window.FB.XFBML.parse(document.getElementById("${uniqueId}"));`,
      '  }',
      '</script>',
    ].join('');
    data.html = html;
  }

  return {
    ...data,
    original_url: url,
    url: data.url ?? url,
    provider_name: data.provider_name ?? 'Facebook',
  };
});
