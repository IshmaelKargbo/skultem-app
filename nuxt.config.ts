export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vite-pwa/nuxt'],
  ui: {
    fonts: false,
  },
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#0f172a' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Skultem' }
      ],
      link: [
        {
          rel: 'manifest',
          href: '/manifest.webmanifest'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://api.fontshare.com'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap'
        }
      ]
    }
  },
  css: ["~/assets/css/main.css"],
  imports: {
    dirs: ["composables/**", "types/**", "utils/**", "stores/**", "api/**"],
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      limit: process.env.NUXT_PUBLIC_LIMIT
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    devOptions: {
      enabled: false
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,ico,png,svg,webmanifest}'],
      globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true
    },
    manifest: {
      id: '/',
      name: 'Skultem',
      short_name: 'Skultem',
      description: 'School management and assessment system',
      theme_color: '#0f172a',
      background_color: '#ffffff',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    }
  },
  pinia: {
    storesDirs: ["./stores"],
  },
})
