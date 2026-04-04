export default defineNuxtPlugin(async () => {
    const token = useCookie('access_token')
    const route = useRoute()
    if (!token.value) return

    const userStore = useUserStore()
    const { initializeActiveRole, clearRole, setAuthResolved } = useAuth()
    const { hide } = useGlobalLoader()

    try {
        await userStore.me()
        initializeActiveRole()
    } catch (error) {
        clearRole()
        console.log(error)
    } finally {
        setAuthResolved(true)
        if (route.path === '/unauthorized') {
            hide()
        }
    }
})
