export default defineNuxtPlugin(async () => {
    const { activeRole, setActiveRole } = useAuth()
    const userStore = useUserStore()

    await userStore.me()

    const cached = localStorage.getItem('active-role')

    if (cached && userStore.user?.roles?.includes(cached)) {
        setActiveRole(cached)
    } else {
        setActiveRole(userStore.user?.roles?.[0] ?? '')
    }

    watch(() => activeRole.value, (val) => {
        localStorage.setItem('active-role', val)
    }, { immediate: true })
})