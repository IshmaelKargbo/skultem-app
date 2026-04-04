interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}

export function usePwaInstall() {
  const deferredPrompt = useState<BeforeInstallPromptEvent | null>('pwa-deferred-prompt', () => null)
  const listenersReady = useState<boolean>('pwa-install-listeners-ready', () => false)
  const canInstall = computed(() => !!deferredPrompt.value)

  async function install() {
    if (!deferredPrompt.value) return false

    const promptEvent = deferredPrompt.value
    await promptEvent.prompt()
    await promptEvent.userChoice
    deferredPrompt.value = null

    return true
  }

  if (import.meta.client && !listenersReady.value) {
    listenersReady.value = true

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      deferredPrompt.value = event as BeforeInstallPromptEvent
    })

    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null
    })
  }

  return { canInstall, install }
}
