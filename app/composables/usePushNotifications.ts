// Native device notifications (Web Push) for this browser / installed app. Turning them on asks the device for
// permission, subscribes with its push service using the server's public key, and registers the subscription
// with the server - from then on Skultem notifications pop up on the device even when the app is closed.

export type PushState = 'unsupported' | 'needs-install' | 'off' | 'on' | 'blocked' | 'server-off'

const state = ref<PushState>('off')
const busy = ref(false)

function supported() {
  return import.meta.client && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// iPhone/iPad only allow web notifications for an app added to the Home Screen.
function isIos() {
  return import.meta.client && /iphone|ipad|ipod/i.test(navigator.userAgent)
}
function isStandalone() {
  return import.meta.client && (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true)
}

// The app's service worker - or null when there isn't one (e.g. the dev server, where it's turned off).
async function registration(): Promise<ServiceWorkerRegistration | null> {
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return null
  return reg.active ? reg : await Promise.race([navigator.serviceWorker.ready, new Promise<null>(r => setTimeout(() => r(null), 4000))])
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

export function usePushNotifications() {
  async function refresh() {
    if (!supported()) {
      state.value = isIos() && !isStandalone() ? 'needs-install' : 'unsupported'
      return state.value
    }
    if (Notification.permission === 'denied') {
      state.value = 'blocked'
      return state.value
    }
    const reg = await registration()
    const sub = reg ? await reg.pushManager.getSubscription() : null
    state.value = sub && Notification.permission === 'granted' ? 'on' : 'off'
    return state.value
  }

  async function enable() {
    if (!supported()) return refresh()
    busy.value = true
    try {
      const server = await PushApi().getPublicKey()
      if (!server?.enabled || !server.publicKey) {
        state.value = 'server-off'
        return state.value
      }
      // Has to come from a tap (iOS requires it).
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        state.value = permission === 'denied' ? 'blocked' : 'off'
        return state.value
      }
      const reg = await registration()
      if (!reg) throw new Error('Notifications need the installed app (or the live site) - not available here')

      let sub = await reg.pushManager.getSubscription()
      const key = urlBase64ToUint8Array(server.publicKey)
      // A subscription made with another server key can't be used - start over.
      const sameKey = sub?.options?.applicationServerKey
        && new Uint8Array(sub.options.applicationServerKey as ArrayBuffer).toString() === key.toString()
      if (sub && !sameKey) {
        await sub.unsubscribe()
        sub = null
      }
      sub = sub ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
      await PushApi().subscribe(sub.toJSON())
      state.value = 'on'
      return state.value
    } finally {
      busy.value = false
    }
  }

  async function disable() {
    busy.value = true
    try {
      const reg = supported() ? await registration() : null
      const sub = reg ? await reg.pushManager.getSubscription() : null
      if (sub) {
        await PushApi().unsubscribe(sub.endpoint).catch(() => {})
        await sub.unsubscribe()
      }
      await refresh()
    } finally {
      busy.value = false
    }
  }

  // Signed in on a device that already allowed notifications: make sure it is registered for this user.
  async function resync() {
    if (!supported() || Notification.permission !== 'granted') return
    try {
      const reg = await registration()
      const sub = reg ? await reg.pushManager.getSubscription() : null
      if (sub) await PushApi().subscribe(sub.toJSON())
      await refresh()
    } catch {
      // Not worth bothering the user about - the profile card can turn it on again.
    }
  }

  // Before signing out: this device should stop getting this person's notifications.
  async function forgetDevice() {
    if (!supported()) return
    try {
      const reg = await registration()
      const sub = reg ? await reg.pushManager.getSubscription() : null
      if (sub) await PushApi().unsubscribe(sub.endpoint)
    } catch {
      // Signing out must not fail because of this.
    }
  }

  return { state, busy, refresh, enable, disable, resync, forgetDevice }
}
