export default defineNuxtPlugin(async () => {
    const token = useCookie('access_token')
    if (!token.value) return

    const { activeRole, setActiveRole } = useAuth()
    const userStore = useUserStore()

    try {
        await userStore.me()
    } catch (error) {
        console.log(error)
    }

    const cached = localStorage.getItem('active-role')

    if (cached && userStore.user?.roles?.includes(cached)) {
        setActiveRole(cached)
    } else {
        setActiveRole(userStore.user?.roles?.[0] ?? '')
    }

    watch(() => activeRole.value, (val) => {
        localStorage.setItem('active-role', val)
    })
})