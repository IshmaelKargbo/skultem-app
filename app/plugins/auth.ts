export default defineNuxtPlugin(async () => {
    const { accessToken: token, refreshToken, activeRole } = useAuthCookies()
    const route = useRoute()
    if (!token.value) return

    const userStore = useUserStore()
    const { initializeActiveRole, clearRole, setAuthResolved } = useAuth()
    const { applyBrandColorsForCurrentSchool } = useBranding()
    const { hide } = useGlobalLoader()

    setAuthResolved(false)

    try {
        await userStore.me()
        initializeActiveRole()
        // Best-effort and skipped on the admin portal (no school, no modules): failing to load
        // the module list fails open (nothing hidden) and must never be mistaken for an auth
        // failure and clear the session below - the backend enforces installs regardless.
        if (!isAdminPortalHost(useRequestURL().hostname)) {
            await useModuleStore().fetch().catch(() => { })
        }
        // Best-effort inside itself (never throws) - a branding fetch failure must not be
        // mistaken for an auth failure and clear the user's session below.
        await applyBrandColorsForCurrentSchool()
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
