/**
 * Public Iframely key (MD5) — same as template-embed-utils.html embed.js.
 * Must be sent as key= on /api/oembed, not api_key= (see iframe.ly/docs/allow-origins).
 */
export const IFRAMELY_PUBLIC_KEY = 'a5ee9a89addd13b7a2e3a48c23e74e8d';

/**
 * Replace angular-embed's iframelyService (which uses api_key=) with key= requests.
 */
function normalizeEmbedUrl(url) {
    if (!url || typeof url !== 'string') {
        return url;
    }

    let normalized = url.trim();

    // embed-block.js may pass an already-encoded URL; decode once before the API call.
    try {
        if (/%[0-9A-Fa-f]{2}/.test(normalized)) {
            const decoded = decodeURIComponent(normalized.replace(/\+/g, ' '));

            if (/^https?:\/\//i.test(decoded)) {
                normalized = decoded;
            }
        }
    } catch (e) {
        // keep original url
    }

    return normalized;
}

export function setupIframelyPublicKeyProvider(iframelyServiceProvider, config) {
    const publicKey = (config && config.iframely && config.iframely.key) || IFRAMELY_PUBLIC_KEY;

    iframelyServiceProvider.useOembed();
    iframelyServiceProvider.$get = ['$http', function($http) {
        return {
            embed(url) {
                const targetUrl = normalizeEmbedUrl(url);

                return $http({
                    method: 'GET',
                    url: 'https://iframe.ly/api/oembed',
                    params: {
                        key: publicKey,
                        url: targetUrl,
                    },
                }).then((response) => response.data);
            },
        };
    }];
}
