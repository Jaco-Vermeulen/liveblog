

const path = require('path');
const makeConfig = require('../../webpack.config.js');

/**
 * webpack-dev-server/sockjs URL for the browser.
 * Behind nginx (SUPERDESK_CLIENT_URL without :9000) we skip the WDS client entirely
 * so the browser does not call https://domain:9000/sockjs-node/...
 */
function buildAppEntry(webpackConfig) {
    const clientUrl = (process.env.SUPERDESK_CLIENT_URL || '').replace(/\/$/, '');

    if (clientUrl && !/:9000(\/|$)/.test(clientUrl)) {
        return webpackConfig.entry.app;
    }

    const devBase = clientUrl || 'http://localhost:9000';
    return [`webpack-dev-server/client?${devBase}/`].concat(webpackConfig.entry.app);
}

function wdsPublicOption() {
    const clientUrl = process.env.SUPERDESK_CLIENT_URL || '';
    if (!clientUrl || /:9000/.test(clientUrl)) {
        return 'localhost:9000';
    }
    try {
        const u = new URL(clientUrl);
        const port = u.port || (u.protocol === 'https:' ? '443' : '80');
        return `${u.hostname}:${port}`;
    } catch (e) {
        return 'localhost:9000';
    }
}

module.exports = function(grunt) {
    const webpackConfig = makeConfig(grunt);

    return {
        options: {
            webpack: webpackConfig,
            port: 9000,
            host: '0.0.0.0',
            public: wdsPublicOption(),
            disableHostCheck: true,
            contentBase: './dist',
            hot: false,
            headers: {
                'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
            }
        },
        start: {
            webpack: {
                devtool: 'source-map',
                entry: {
                    app: buildAppEntry(webpackConfig)
                },
                output: {
                    publicPath: ''
                }
            }
        },
        docs: {
            keepAlive: true,
            contentBase: './docs/dist',
            port: 9100,
            webpack: {
                entry: {
                    docs: ['webpack-dev-server/client?http://0.0.0.0:9100/', 'docs/index']
                },
                output: {
                    path: path.join(process.cwd(), 'docs/dist'),
                    publicPath: 'docs/dist'
                },
                devtool: 'eval'
            }
        }
    };
};
