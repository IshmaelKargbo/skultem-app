export default defineNuxtPlugin(async () => {
    const { accessToken: token, refreshToken, activeRole } = useAuthCookies()
    const route = useRoute()
    if (!token.value) return

    const userStore = useUserStore()
    const { initializeActiveRole, clearRole, setAuthResolved } = useAuth()
    const { hide } = useGlobalLoader()

    setAuthResolved(false)

    try {
        await userStore.me()
        initializeActiveRole()
    } catch (error) {
        token.value = null
        refreshToken.value = null
        activeRole.value = null
        clearRole()
        console.error(error)
    } finally {
        setAuthResolved(true)
        if (route.path === '/unauthorized') {
            hide()
        }
    }
})
