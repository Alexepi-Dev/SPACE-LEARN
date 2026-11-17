import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg', 'offline.html'],
      manifest: {
        name: 'SPACE LEARN',
        short_name: 'SPACE LEARN',
        description: "Application éducative pour apprendre et explorer l'astronomie.",
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#174F3B',
        background_color: '#F5F7F5',
        lang: 'fr',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigationPreload: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/offline.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.nasa\.gov\/planetary\/apod/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nasa-apod',
              expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/api\.nasa\.gov\/planetary\/some-other-endpoint/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nasa-others',
              expiration: { maxEntries: 30, maxAgeSeconds: 12 * 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
        // keep existing runtimeCaching definition and extend
        navigationPreload: true,
        cleanupOutdatedCaches: true,
        // Fallback page for navigation when offline
        navigateFallback: '/offline.html',
        // Cache strategies for static assets (already defined earlier)
        // We'll keep the earlier runtimeCaching array untouched – it will be merged.
      },

      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SPACE LEARN',
        short_name: 'SPACE LEARN',
        description: 'Plateforme éducative bilingue pour découvrir l\'astronomie et les sciences spatiales.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#174F3B',
        background_color: '#F5F7F5',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigationPreload: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/offline.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.nasa\.gov\/planetary\/apod/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nasa-apod',
              expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/api\.nasa\.gov\/planetary\/some-other-endpoint/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nasa-others',
              expiration: { maxEntries: 30, maxAgeSeconds: 12 * 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
        // Strategies for caching
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.nasa\.gov\/planetary\/apod/, // APOD endpoint
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nasa-apod',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/api\.nasa\.gov\/planetary\/some-other-endpoint/, // placeholder for other NASA APIs
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nasa-others',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 12 * 60 * 60, // 12h
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
        // Avoid caching the service worker itself with immutable cache headers
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})