export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vite-pwa/nuxt'],
  ui: {
    fonts: false,
  },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap'
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
      enabled: true
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js']
    },
    manifest: {
      name: 'Skultem',
      short_name: 'Skultem',
      description: 'School management and assessment system',
      theme_color: '#0f172a',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },
  pinia: {
    storesDirs: ["./stores"],
  },
})
