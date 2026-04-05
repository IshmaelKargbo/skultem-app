export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client || !('serviceWorker' in navigator) || !nuxtApp.$pwa) {
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
