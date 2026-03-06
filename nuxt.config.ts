export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  ui: {
    fonts: false,
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
