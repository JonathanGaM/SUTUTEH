// build-sw.js (sin variables externas)
const { generateSW } = require('workbox-build');

generateSW({
  swDest: 'build/sw.js',
  globDirectory: 'build',
  globPatterns: ['**/*.{html,js,css,svg,png,webp,woff2,json}'],
  skipWaiting: true,
  clientsClaim: true,
  navigateFallback: '/index.html',

  runtimeCaching: [
    // JS/CSS del frontend
    {
      urlPattern: ({request}) => request.destination === 'script' || request.destination === 'style',
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'app-assets' }
    },

    // Imágenes del mismo dominio
    {
      urlPattern: ({request, url}) => request.destination === 'image' && url.origin === self.location.origin,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-public',
        expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 }
      }
    },

    // API pública – mismo dominio (ej: https://sututeh.com/api/public/...)
    {
      urlPattern: /\/api\/public\/.+/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-public',
        networkTimeoutSeconds: 3,
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 }
      }
    },

    // API pública – backend Render (origen cruzado)
    {
      urlPattern: /^https:\/\/sututeh-server\.onrender\.com\/api\/public\/.+/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-public-backend',
        networkTimeoutSeconds: 3,
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 }
      }
    },

    // Archivos públicos servidos por backend (PDF/imagenes subidas)
    {
      urlPattern: /^https:\/\/sututeh-server\.onrender\.com\/(uploads|files)\/public\/.*\.(pdf|png|jpe?g|webp|svg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'files-publicos',
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }
      }
    },

    // Todo lo privado (JWT) NO se cachea
    {
      urlPattern: /\/api\/(?!public\/).+/,
      handler: 'NetworkOnly'
    }
  ]
}).then(({count, size}) => {
  console.log(`✅ Precache de ${count} archivos (~${(size/1024).toFixed(1)} KB)`);
});
