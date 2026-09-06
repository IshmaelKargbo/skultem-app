export default defineNuxtPlugin(() => {
    const { show, hide } = useGlobalLoader()
    const { accessToken: token } = useAuthCookies()
    const nuxtApp = useNuxtApp()
    const router = useRouter()

    // Hook Nuxt's page:loading:* lifecycle rather than registering our own router.beforeEach.
    // Nuxt's pages router plugin runs with enforce: 'pre', so its beforeEach (which runs every
    // global middleware, including auth.global.ts's async tenant/session check) is registered -
    // and therefore executes - before this plugin's would, since plugins run in order and this
    // one isn't 'pre'. Router guards run strictly in registration order, so a beforeEach here
    // would only fire *after* that middleware chain resolves, not before it - the spinner would
    // show up only once the slow part was already done. During that gap the page stays fully
    // interactive with no visual feedback, so a slow navigation invites a second click, which
    // lands on the real link/button underneath (not this overlay) and fires a second genuine
    // navigation. page:loading:start is called synchronously at the very top of that same guard,
    // before any middleware runs, so hooking it here shows the loader immediately on click -
    // early enough that the backdrop is already covering the page (and swallowing further clicks)
    // while the middleware/data fetch is still in flight.
    nuxtApp.hook('page:loading:start', () => {
        show({
            title: 'Loading page...',
            subtitle: 'Please wait',
            hint: 'Fetching content'
        })
    })

    nuxtApp.hook('page:loading:end', () => hide())
    nuxtApp.hook('page:finish', () => hide())
    nuxtApp.hook('app:error', () => hide())
    router.afterEach(() => hide())
    router.onError(() => hide())

    watch(
        () => token.value,
        (currentToken) => {
            if (!currentToken) {
                hide()
            }
        },
        { immediate: true }
    )
})
