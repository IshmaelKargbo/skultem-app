export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
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
  pinia: {
    storesDirs: ["./stores"],
  },
})