export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client || !('serviceWorker' in navigator) || !nuxtApp.$pwa) {
    return
  }

  // `devOptions.enabled: true` (nuxt.config.ts) keeps the service worker + manifest real under
  // `nuxt dev` too, deliberately, so a phone can install/splash-screen against the dev server -
  // but the dev SW's precache manifest isn't content-stable across requests the way a production
  // build's is, so it can flag "an update is available" on nearly every request. Auto-reloading
  // on every controllerchange turned that into a genuine infinite loop: reload -> app remounts ->
  // dev SW sees another "update" -> controllerchange -> reload -> ... each cycle re-fires every
  // page's onMounted fetches (that's the flood of identical requests you'd see in the console)
  // until the tab runs out of memory and crashes. Vite's own HMR already handles live-reloading
  // for real code changes in dev, so this auto-reload is only needed - and only safe - in
  // production, where the manifest is actually stable and an update means an update.
  if (import.meta.dev) {
    return
  }

  let isReloading = false

  const reloadPage = () => {
    if (isReloading) {
      return
    }

    isReloading = true
    window.location.reload()
  }

  navigator.serviceWorker.addEventListener('controllerchange', reloadPage)

  watch(
    () => nuxtApp.$pwa?.needRefresh,
    (needRefresh) => {
      if (!needRefresh || isReloading) {
        return
      }

      void nuxtApp.$pwa?.updateServiceWorker()
    },
    { immediate: true }
  )
})
