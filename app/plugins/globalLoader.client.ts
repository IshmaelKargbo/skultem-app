export default defineNuxtPlugin(() => {
    const { show, hide } = useGlobalLoader()
    const { authResolved } = useAuth()
    const token = useCookie('access_token')

    const router = useRouter()

    const shouldHideLoader = (path: string) => {
        if (path === '/unauthorized') return true
        if (!token.value) return true
        return authResolved.value
    }

    router.beforeEach((to) => {
        show({
            title: 'Loading page...',
            subtitle: 'Please wait',
            hint: 'Fetching content'
        })

        if (shouldHideLoader(to.path)) {
            hide()
        }
    })

    router.afterEach((to) => {
        if (shouldHideLoader(to.path)) {
            hide()
        }
    })

    watch(
        () => [authResolved.value, router.currentRoute.value.path, token.value] as const,
        ([resolved, path, currentToken]) => {
            if (path === '/unauthorized' || !currentToken || resolved) {
                hide()
            }
        },
        { immediate: true }
    )
})
