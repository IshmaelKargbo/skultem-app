const appleSplashScreens = [
  { width: 640, height: 1136, media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
  { width: 750, height: 1334, media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
  { width: 828, height: 1792, media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)' },
  { width: 1125, height: 2436, media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
  { width: 1170, height: 2532, media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
  { width: 1179, height: 2556, media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)' },
  { width: 1242, height: 2208, media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)' },
  { width: 1242, height: 2688, media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)' },
  { width: 1284, height: 2778, media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
  { width: 1290, height: 2796, media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
  { width: 1536, height: 2048, media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)' },
  { width: 1620, height: 2160, media: '(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)' },
  { width: 1668, height: 2224, media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)' },
  { width: 1668, height: 2388, media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)' },
  { width: 2048, height: 2732, media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)' }
]

// Light matches the app's light theme background; dark matches --app-bg in
// assets/css/main.css. splashBackgroundColor stays the manifest's single value (the Web App
// Manifest spec has no light/dark variant for background_color/theme_color) - everything that
// *can* respond to prefers-color-scheme (the theme-color meta tags, the apple-touch-startup-image
// links below) uses both.
const splashBackgroundColor = '#f7fbff'
const splashBackgroundColorDark = '#0f121f'

export default defineNuxtConfig({
  ssr: false,

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@vite-pwa/nuxt'],

  ui: {
    fonts: false
  },

  app: {
    head: {
      meta: [
        // Two theme-color tags (not one) so the browser/OS chrome (Android status bar, Safari's
        // tab bar) tints itself to match whichever scheme is actually active instead of always
        // showing the light splash color.
        { name: 'theme-color', content: splashBackgroundColor, media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: splashBackgroundColorDark, media: '(prefers-color-scheme: dark)' },

        // ✅ iOS/PWA improvements
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Skultem' },

        // ✅ FIX: safe viewport handling (notch + layout stability)
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' }
      ],

      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },

        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },

        // Two links per size (not one) - iOS 16.4+ picks the one whose prefers-color-scheme
        // clause matches the device's active appearance; older iOS just takes the first match per
        // device size, which is the light one here, so falls back sanely rather than erroring.
        ...appleSplashScreens.flatMap(({ width, height, media }) => [
          {
            rel: 'apple-touch-startup-image',
            href: `/splash/apple-splash-${width}x${height}-light.png`,
            media: `${media} and (prefers-color-scheme: light)`
          },
          {
            rel: 'apple-touch-startup-image',
            href: `/splash/apple-splash-${width}x${height}-dark.png`,
            media: `${media} and (prefers-color-scheme: dark)`
          }
        ]),

        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://api.fontshare.com' },

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

  css: ['~/assets/css/main.css'],

  imports: {
    dirs: ['composables/**', 'types/**', 'utils/**', 'stores/**', 'api/**']
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      limit: process.env.NUXT_PUBLIC_LIMIT,
      domain: process.env.NUXT_PUBLIC_DOMAIN,
      // The reserved subdomain the system-admin portal lives on (e.g. admin.skultem.space) -
      // never a real school's domain. See utils/tenant.ts.
      adminSubdomain: process.env.NUXT_PUBLIC_ADMIN_SUBDOMAIN || 'admin'
    }
  },

  pwa: {
    registerType: 'autoUpdate',

    includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'splash/*.png'],

    // Enabled so the manifest + service worker are real in `nuxt dev` too —
    // otherwise /manifest.webmanifest falls through to the SPA shell (served
    // as HTML, not JSON) and a phone can never install/splash-screen a PWA
    // pointed at the dev server.
    devOptions: {
      enabled: true,
      type: 'module'
    },

    workbox: {
      navigateFallback: '/',
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,

      // navigateFallback: '/' registers a NavigationRoute that calls
      // createHandlerBoundToURL('/') at runtime - that throws "non-precached-url" unless the
      // precache manifest actually has an entry whose url is '/'. In this ssr:false build that
      // entry comes from index.html (vite-plugin-pwa rewrites its precached url to '/'), so
      // 'html' must be in globPatterns or the fallback route is registered against a URL that
      // was never cached.
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],

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
      theme_color: splashBackgroundColor,
      background_color: splashBackgroundColor,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      orientation: 'portrait',

      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    }
  },

  pinia: {
    storesDirs: ['./stores']
  }
})
