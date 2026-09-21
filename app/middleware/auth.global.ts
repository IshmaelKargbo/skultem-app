// Public marketing/lead pages that must work without a resolved school tenant or a logged-in
// session - e.g. linked directly from the corporate site.
const PUBLIC_PATHS = ['/request-demo']

// Every route that exists on the admin subdomain - see isAdminPortalHost(). No "/system-admin"
// prefix: since the subdomain itself already says this is the admin portal, its own dashboard,
// login and other pages just live at the same top-level paths a school's own subdomain would use
// ("/", "/login", ...), reusing those same page components (see pages/login.vue, pages/index.vue)
// rather than a separate page tree. /users, /schools, /schools/add, /calendar and /setup have no
// school-tenant equivalent, so they're admin-portal-only. /logout, /profile, /reset-password and
// /unauthorized are the account pages the portal's own header/drawer and the redirects below
// send an admin to - leaving them out made "Sign out" 404 on the admin subdomain.
const ADMIN_PORTAL_PATHS = ['/', '/login', '/logout', '/profile', '/reset-password', '/unauthorized', '/users', '/schools', '/schools/add', '/calendar', '/setup']
// Of those, the ones reachable without a token - signing in, and the one-time first-admin wizard.
const ADMIN_PORTAL_PUBLIC_PATHS = ['/login', '/setup']

export default defineNuxtRouteMiddleware(async (to) => {
    if (PUBLIC_PATHS.includes(to.path)) {
        return
    }

    const { accessToken: token } = useAuthCookies()
    const { activeRole } = useAuth()
    const store = useUserStore()

    const onAdminPortal = isAdminPortalHost(useRequestURL().hostname)

    // The admin portal isn't any school's subdomain - there's no tenant to resolve here, and
    // every page outside ADMIN_PORTAL_PATHS simply doesn't exist on this host.
    if (onAdminPortal) {
        if (!ADMIN_PORTAL_PATHS.includes(to.path)) {
            return abortNavigation(createError({ statusCode: 404, message: 'Page not found' }))
        }

        if (!token.value && !ADMIN_PORTAL_PUBLIC_PATHS.includes(to.path)) {
            return navigateTo('/login')
        }

        if (token.value && to.path === '/login') {
            return navigateTo('/')
        }
    } else {
        // Symmetric with the admin-portal branch above: /users, /schools, /calendar and /setup only exist on
        // the admin subdomain, so they 404 here exactly like a school-scoped page would 404 there.
        // This closes what used to be a real route - a SYSTEM_ADMIN whose anchor SchoolUser row
        // happens to sit on some school's own subdomain could otherwise still reach the admin
        // pages from that tenant host directly, bypassing the admin subdomain entirely.
        if (to.path === '/users' || to.path === '/schools' || to.path === '/schools/add' || to.path === '/calendar' || to.path === '/setup') {
            return abortNavigation(createError({ statusCode: 404, message: 'Page not found' }))
        }

        const tenant = await checkTenant()
        if (tenant == null) {
            return abortNavigation(createError({ statusCode: 404, message: 'School not found' }))
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

    if (!token.value && to.path !== "/login" && to.path !== "/setup") {
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

    // A route belonging to a module this school hasn't installed (see utils/modules.ts): send the
    // people who can install it to the Modules page, remembering where they were going; everyone
    // else just goes home. The module list is normally loaded at startup (plugins/auth.ts) - this
    // covers a session that started at the login page. Fails open if it can't be loaded.
    if (!onAdminPortal && token.value) {
        const modules = useModuleStore()
        if (!modules.loaded) {
            await modules.fetch().catch(() => { })
        }

        const moduleKey = moduleForPath(to.path)
        if (moduleKey && modules.loaded && !modules.isInstalled(moduleKey)) {
            const canInstall = ['ADMIN', 'OWNER', 'PROPRIETOR'].includes(activeRole.value)
            return canInstall
                ? navigateTo({ path: '/modules', query: { install: moduleKey, redirect: to.fullPath } })
                : navigateTo('/')
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
