interface LoaderOptions {
    title?: string
    subtitle?: string
    hint?: string
}

const MIN_VISIBLE_MS = 250

export function useGlobalLoader() {
    const visible = useState('loader-visible', () => false)
    const title = useState('loader-title', () => 'Loading...')
    const subtitle = useState('loader-subtitle', () => 'Please wait')
    const hint = useState('loader-hint', () => '')
    const shownAt = useState('loader-shown-at', () => 0)
    const hideTimer = useState<ReturnType<typeof setTimeout> | null>('loader-hide-timer', () => null)

    function show(options: LoaderOptions = {}) {
        if (hideTimer.value) {
            clearTimeout(hideTimer.value)
            hideTimer.value = null
        }

        title.value = options.title ?? 'Loading...'
        subtitle.value = options.subtitle ?? 'Please wait'
        hint.value = options.hint ?? ''
        shownAt.value = Date.now()
        visible.value = true
    }

    function hide() {
        if (hideTimer.value) {
            clearTimeout(hideTimer.value)
            hideTimer.value = null
        }

        if (!visible.value) return

        const remaining = Math.max(MIN_VISIBLE_MS - (Date.now() - shownAt.value), 0)
        if (remaining === 0) {
            visible.value = false
            return
        }

        hideTimer.value = setTimeout(() => {
            visible.value = false
            hideTimer.value = null
        }, remaining)
    }

    return { visible, title, subtitle, hint, show, hide }
}
