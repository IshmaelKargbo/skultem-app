// A deploy replaces the hashed /_nuxt/*.js chunks. A tab (or service-worker precache) still holding the
// previous build then fails with "Failed to fetch dynamically imported module" when it lazy-loads a route.
// Reload once to pick up the new build; the sessionStorage stamp stops a genuinely broken chunk from
// causing a reload loop.
const RELOAD_KEY = 'chunk-error-reload-at'
const RELOAD_COOLDOWN_MS = 30_000

export default defineNuxtPlugin((nuxtApp) => {
  const reloadOnce = () => {
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
      if (Date.now() - last < RELOAD_COOLDOWN_MS) {
        return
      }
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
    } catch {
      return
    }

    window.location.reload()
  }

  // Vite fires this for failed dynamic-import preloads.
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    reloadOnce()
  })

  // Nuxt fires this when a lazy route/component chunk fails to load.
  nuxtApp.hook('app:chunkError', reloadOnce)
})
