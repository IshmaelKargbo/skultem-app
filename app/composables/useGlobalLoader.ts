interface LoaderOptions {
    title?: string
    subtitle?: string
    hint?: string
}

export function useGlobalLoader() {
    const visible = useState('loader-visible', () => false)
    const title = useState('loader-title', () => 'Loading...')
    const subtitle = useState('loader-subtitle', () => 'Please wait')
    const hint = useState('loader-hint', () => '')

    function show(options: LoaderOptions = {}) {
        title.value = options.title ?? 'Loading...'
        subtitle.value = options.subtitle ?? 'Please wait'
        hint.value = options.hint ?? ''
        visible.value = true
    }

    function hide() {
        visible.value = false
    }

    return { visible, title, subtitle, hint, show, hide }
}
