interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}

type PwaInstallResult = 'prompted' | 'instructions' | 'unavailable'

export function usePwaInstall() {
  const deferredPrompt = useState<BeforeInstallPromptEvent | null>('pwa-deferred-prompt', () => null)
  const listenersReady = useState<boolean>('pwa-install-listeners-ready', () => false)
  const isIos = useState<boolean>('pwa-install-ios', () => false)
  const isStandalone = useState<boolean>('pwa-install-standalone', () => false)
  const canInstall = computed(() => !isStandalone.value && (!!deferredPrompt.value || isIos.value))

  function refreshInstallState() {
    if (!import.meta.client) return

    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
    const userAgent = navigator.userAgent.toLowerCase()
    const isAppleTouchDevice = userAgent.includes('iphone') || userAgent.includes('ipad') || (
      userAgent.includes('macintosh') && navigator.maxTouchPoints > 1
    )

    isIos.value = isAppleTouchDevice
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
  }

  async function install(): Promise<PwaInstallResult> {
    refreshInstallState()

    if (!deferredPrompt.value) {
      if (isIos.value && !isStandalone.value) {
        window.alert('On iPhone, open this page in Safari, tap Share, then tap Add to Home Screen.')
        return 'instructions'
      }

      return 'unavailable'
    }

    const promptEvent = deferredPrompt.value
    await promptEvent.prompt()
    await promptEvent.userChoice
    deferredPrompt.value = null

    return 'prompted'
  }

  if (import.meta.client && !listenersReady.value) {
    listenersReady.value = true
    refreshInstallState()

    window.matchMedia('(display-mode: standalone)').addEventListener('change', refreshInstallState)

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      refreshInstallState()
      deferredPrompt.value = event as BeforeInstallPromptEvent
    })

    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null
      isStandalone.value = true
    })
  }

  return { canInstall, install }
}
