export default defineNuxtRouteMiddleware(async (to) => {
    const token = useCookie("access_token")
    const { activeRole } = useAuth()
    const store = useUserStore()

    const tenant = await checkTenant()
    if (tenant == null) {
        return abortNavigation(createError({ statusCode: 404, message: 'School not found' }))
    }

    const { user } = storeToRefs(store)
    const requiredRole = to.meta.role as string | string[] | undefined

    if (user.value.status == "RESET_PASSWORD" && to.path !== "/reset-password") {
        return navigateTo("/reset-password")
    }

    if (user.value.status != "RESET_PASSWORD" && to.path == "/reset-password") {
        return navigateTo("/")
    }

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

})

async function checkTenant() {
    try {
        const store = useAppStore()
        const { tenant } = storeToRefs(store)
        const hostname = useRequestURL().hostname

        const domain =
            hostname.includes('localhost')
                ? 'moriba'
                : hostname.split('.')[0]

        await store.checkTenant(domain || '')
        return tenant
    } catch (error) {
        return
    }
}
