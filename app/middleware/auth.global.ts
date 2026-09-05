// Public marketing/lead pages that must work without a resolved school tenant or a logged-in
// session - e.g. linked directly from the corporate site.
const PUBLIC_PATHS = ['/request-demo']

export default defineNuxtRouteMiddleware(async (to) => {
    if (PUBLIC_PATHS.includes(to.path)) {
        return
    }

    const { accessToken: token } = useAuthCookies()
    const { activeRole } = useAuth()
    const store = useUserStore()

    const onAdminPortal = isAdminPortalHost(useRequestURL().hostname)

    // The system-admin portal isn't any school's subdomain - there's no tenant to resolve here,
    // and school-scoped pages (everything outside /system-admin) simply don't exist on this host.
    if (onAdminPortal) {
        if (!token.value && to.path !== '/system-admin/login') {
            return navigateTo('/system-admin/login')
        }

        if (token.value && to.path === '/system-admin/login') {
            return navigateTo('/system-admin')
        }

        if (token.value && !to.path.startsWith('/system-admin')) {
            return navigateTo('/system-admin')
        }
    } else {
        const tenant = await checkTenant()
        if (tenant == null) {
            return abortNavigation(createError({ statusCode: 404, message: 'School not found' }))
        }

        // The portal login lives at this same path on every host (see system-admin/login.vue),
        // but a real school subdomain has a tenant to send an unauthenticated visitor to instead.
        if (!token.value && to.path === '/system-admin/login') {
            return navigateTo('/login')
        }
    }

    const { user } = storeToRefs(store)
    const requiredRole = to.meta.role as string | string[] | undefined

    if (user.value.status == "RESET_PASSWORD" && to.path !== "/reset-password") {
        return navigateTo("/reset-password")
    }

    if (user.value.status != "RESET_PASSWORD" && to.path == "/reset-password") {
        return navigateTo("/")
    }

    if (!token.value && to.path !== "/login" && to.path !== "/system-admin/login") {
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

        await store.checkTenant(resolveTenantSlug(useRequestURL().hostname))
        return tenant
    } catch (error) {
        return
    }
}
