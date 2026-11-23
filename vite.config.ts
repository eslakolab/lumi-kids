import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'لُومِي - تَعَلَّمْ وَامْرَحْ | Lumi Kids',
          short_name: 'Lumi',
          description: 'تطبيق لومي التعليمي التفاعلي للأطفال: الحروف، التهجئة، الكلمات، والرياضيات بالصور الواقعية.',
          theme_color: '#F59E0B',
          background_color: '#FFFBEB',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['education', 'kids'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,webp,svg,woff,woff2,mp3}'],
          globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js', 'src/assets/**'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'pwa-safe-dev-sw-register',
        enforce: 'post',
        apply: 'serve',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            return html.replace(
              /<script id="vite-plugin-pwa:register-dev-sw"[^>]*>[\s\S]*?<\/script>/,
              `<script id="vite-plugin-pwa:register-dev-sw">if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/dev-sw.js?dev-sw',{scope:'/',type:'module'}).catch(()=>{});});}</script>`
            );
          },
        },
      },
      {
        name: 'copy-src-assets-for-prod',
        apply: 'build',
        closeBundle() {
          const srcDir = path.resolve(import.meta.dirname, 'src/assets/images');
          const destDir = path.resolve(import.meta.dirname, 'dist/src/assets/images');
          if (fs.existsSync(srcDir)) {
            fs.mkdirSync(destDir, { recursive: true });
            fs.cpSync(srcDir, destDir, { recursive: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
