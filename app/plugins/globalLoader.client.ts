export default defineNuxtPlugin(() => {
    const { hide } = useGlobalLoader()
    const { accessToken: token } = useAuthCookies()
    const nuxtApp = useNuxtApp()
    const router = useRouter()

    // Route navigation no longer shows the full-screen loader - <NuxtLoadingIndicator> in app.vue
    // draws a thin top bar for that instead. The overlay is now only shown explicitly (first load,
    // sign-in, role switch, redirect to login); these hooks close it once the navigation those
    // flows end with has settled.
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
