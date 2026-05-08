export default defineNuxtPlugin(() => {
    const { show, hide } = useGlobalLoader()
    const token = useCookie('access_token')
    const nuxtApp = useNuxtApp()
    const router = useRouter()

    router.beforeEach((to) => {
        if (to.path === router.currentRoute.value.path) return

        show({
            title: 'Loading page...',
            subtitle: 'Please wait',
            hint: 'Fetching content'
        })
    })

    router.afterEach(() => hide())
    router.onError(() => hide())

    nuxtApp.hook('page:finish', () => hide())
    nuxtApp.hook('app:error', () => hide())

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
