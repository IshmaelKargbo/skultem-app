// Applies a new deploy without ever reloading the page out from under someone.
//
// It used to reload on `controllerchange` the moment a new service worker took over - with registerType
// 'autoUpdate' + skipWaiting/clientsClaim that happened whenever a deploy landed while a tab sat open (and once more
// on a first visit, when the worker first claimed the page), so the app "reloaded by itself", losing any half-filled
// form. Now (registerType 'prompt' in nuxt.config.ts) the new version waits, and is applied:
//   * on the next page change - the user is leaving this screen anyway, so nothing is lost; or
//   * when they press "Reload" on the notice shown as soon as it is ready.
// Still production only: the dev service worker's precache isn't content-stable and flags an "update" on nearly
// every request (that was an infinite reload loop once - see the pwa block in nuxt.config.ts).
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev || !('serviceWorker' in navigator) || !nuxtApp.$pwa) {
    return
  }

  // @vite-pwa/nuxt's reactive state - typed as {} through the plugin injection.
  const pwa = nuxtApp.$pwa as unknown as { needRefresh: boolean, updateServiceWorker: (reloadPage?: boolean) => Promise<void> }
  let applying = false
  let notified = false

  // Activates the waiting version, then reloads once it is in control.
  const apply = () => {
    if (applying || !pwa.needRefresh) return
    applying = true
    void pwa.updateServiceWorker(true)
  }

  watch(
    () => pwa.needRefresh,
    (needRefresh) => {
      if (!needRefresh || notified) return
      notified = true
      useToast().add({
        title: 'A new version of Skultem is ready',
        description: 'It will load on your next page change, or reload now.',
        color: 'info',
        icon: 'lucide:refresh-cw',
        duration: 0,
        actions: [{ label: 'Reload', color: 'primary', onClick: apply }]
      })
    },
    { immediate: true }
  )

  // A full load of the destination instead of the in-app route change, once the new version is in control - loading
  // it earlier would be served by the old worker and bring the old build straight back.
  useRouter().beforeEach((to, from) => {
    if (!pwa.needRefresh || applying || to.fullPath === from.fullPath) return
    applying = true
    let done = false
    const go = () => {
      if (done) return
      done = true
      window.location.assign(to.fullPath)
    }
    navigator.serviceWorker.addEventListener('controllerchange', go, { once: true })
    setTimeout(go, 3000) // never leave the user stuck if activation stalls
    void pwa.updateServiceWorker(false)
    return false
  })
})
