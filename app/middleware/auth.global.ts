export default defineNuxtRouteMiddleware((to) => {
    const token = useCookie("access_token")
    const { activeRole, authResolved } = useAuth()
    const requiredRole = to.meta.role as string | string[] | undefined

    if (!token.value && to.path !== "/login") {
        if (import.meta.client) {
            const { show } = useGlobalLoader()
            show({ title: 'Redirecting...' })
        }
        return navigateTo("/login")
    }

    if (requiredRole && activeRole.value) {
        const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        if (!allowed.includes(activeRole.value)) {
            return navigateTo('/unauthorized')
        }
    }

    if (import.meta.client) {
        const { hide } = useGlobalLoader()
        if (to.path === '/unauthorized' || !token.value || authResolved.value) {
            hide()
        }
    }
})
