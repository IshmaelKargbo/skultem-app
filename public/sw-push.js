// Loaded into the PWA service worker (nuxt.config pwa.workbox.importScripts). Shows Skultem notifications as
// native device notifications - even when the app is closed - and opens the app when one is tapped.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Skultem', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Skultem'
  const options = {
    body: data.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    // The same notification sent twice replaces itself instead of stacking.
    tag: data.tag || undefined,
    renotify: !!data.tag,
    requireInteraction: !!data.urgent,
    data: { url: data.url || '/' },
  }

  event.waitUntil((async () => {
    // If the app is open and on screen, it already shows the notification itself - don't double it.
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    if (windows.some(w => w.focused && w.visibilityState === 'visible')) return
    await self.registration.showNotification(title, options)
  })())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    // Reuse an open Skultem window if there is one.
    for (const w of windows) {
      if (new URL(w.url).origin === self.location.origin) {
        await w.focus()
        if ('navigate' in w) await w.navigate(url).catch(() => {})
        return
      }
    }
    await self.clients.openWindow(url)
  })())
})
