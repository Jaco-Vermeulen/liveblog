import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_LIVEBLOG_API_URL ?? 'http://localhost:5000';
  const liveblogOrigin = apiTarget.replace(/\/api\/?$/, '');
  const allowedHosts = [
    'localhost',
    '127.0.0.1',
    'live.nuwe-maroela.co.za',
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
        '/api': {
          target: liveblogOrigin,
          changeOrigin: true,
        },
        '/embed/': {
          target: liveblogOrigin,
          changeOrigin: true,
        },
        // Theme static files referenced by /embed pages (scripts, styles, analytics.js)
        '/themes_assets': {
          target: liveblogOrigin,
          changeOrigin: true,
        },
        '/themes_uploads': {
          target: liveblogOrigin,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: Number(process.env.CLIENT_PORT ?? 9000),
      strictPort: true,
      proxy: {
        '/api': {
          target: liveblogOrigin,
          changeOrigin: true,
        },
        '/embed/': {
          target: liveblogOrigin,
          changeOrigin: true,
        },
        '/themes_assets': {
          target: liveblogOrigin,
          changeOrigin: true,
        },
        '/themes_uploads': {
          target: liveblogOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
