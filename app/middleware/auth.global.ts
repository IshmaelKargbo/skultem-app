export default defineNuxtRouteMiddleware((to) => {
    const token = useCookie("access_token")

    if (!token.value && to.path !== "/login") {
        if (import.meta.client) {
            const { show } = useGlobalLoader()
            show({ title: 'Redirecting...' })
        }
        return navigateTo("/login")
    }

    if (import.meta.client) {
        const { activeRole } = useAuth()
        const { hide } = useGlobalLoader()

        const requiredRole = to.meta.role as string | string[] | undefined

        if (requiredRole && activeRole.value) {
            const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
            if (!allowed.includes(activeRole.value)) {
                return navigateTo('/unauthorized')
            }
        }

        hide()
    }
})