import { defineConfig, loadEnv, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

/** Flask SERVER_NAME must match SUPERDESK_URL host — not the Docker internal service name. */
function liveblogProxy(target: string, proxyHost: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('host', proxyHost);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_LIVEBLOG_API_URL ?? 'http://localhost:5000';
  const liveblogOrigin = apiTarget.replace(/\/api\/?$/, '');
  const superdeskUrl = env.SUPERDESK_URL ?? 'http://localhost:5000/api';
  const proxyHost = env.VITE_LIVEBLOG_PROXY_HOST ?? new URL(superdeskUrl).host;
  const apiProxy = liveblogProxy(liveblogOrigin, proxyHost);
  const allowedHosts = [
    'localhost',
    '127.0.0.1',
    'live.maroelamedia.co.za',
    ...(env.VITE_ALLOWED_HOSTS
      ? env.VITE_ALLOWED_HOSTS.split(',').map((host) => host.trim()).filter(Boolean)
      : []),
  ];

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: process.env.VITE_DEV_HOST === '0.0.0.0' ? '0.0.0.0' : true,
      port: Number(process.env.CLIENT_PORT ?? 9000),
      strictPort: true,
      allowedHosts,
      proxy: {
        '/api': apiProxy,
        '/embed/': apiProxy,
        // Theme static files referenced by /embed pages (scripts, styles, analytics.js)
        '/themes_assets': apiProxy,
        '/themes_uploads': apiProxy,
      },
    },
    preview: {
      host: true,
      port: Number(process.env.CLIENT_PORT ?? 9000),
      strictPort: true,
      proxy: {
        '/api': apiProxy,
        '/embed/': apiProxy,
        '/themes_assets': apiProxy,
        '/themes_uploads': apiProxy,
      },
    },
  };
});
