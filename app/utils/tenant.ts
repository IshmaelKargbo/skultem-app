// Single source of truth for turning the current hostname into "which tenant is this" - used by
// login.vue (to know which school domain to log in against) and auth.global.ts (to know whether
// to resolve a school tenant at all, or route to the system-admin portal instead). Previously this
// hostname-parsing logic was duplicated inline in both places.
//
// A real deployment puts every school on its own subdomain (someschool.skultem.space -> "someschool")
// and the system-admin portal on its own reserved one (admin.skultem.space -> "admin", see
// runtimeConf().adminSubdomain). Locally there's no real DNS for that, so only the bare hostname
// "localhost" (no subdomain to parse) falls back to the fixed dev tenant in .env
// (NUXT_PUBLIC_DOMAIN) - a subdomain under localhost, e.g. http://admin.localhost:3000 or
// http://myschool.localhost:3000, is parsed exactly like production. Most browsers/OSes resolve
// any *.localhost host to loopback automatically (RFC 6761), so this needs no /etc/hosts edits.
export function resolveTenantSlug(hostname: string): string {
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return runtimeConf().domain || ''
    }
    return hostname.split('.')[0] || ''
}

export function isAdminPortalHost(hostname: string): boolean {
    return resolveTenantSlug(hostname) === runtimeConf().adminSubdomain
}

// Cross-subdomain link to the admin portal from wherever the page currently is - e.g. login.vue,
// when a SYSTEM_ADMIN authenticates through their anchor school's own tenant login instead of
// the admin subdomain (see BootstrapSystemAdminUseCase: which school a system admin is anchored
// to doesn't matter for permissions, so this can happen). The admin portal's dashboard lives at
// "/" on its own subdomain (see auth.global.ts), so this can't be a same-host navigateTo - it has
// to swap the subdomain itself.
export function adminPortalUrl(location: { hostname: string, protocol: string, port: string }, path = '/'): string {
    const adminSubdomain = runtimeConf().adminSubdomain
    const port = location.port ? `:${location.port}` : ''

    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return `${location.protocol}//${adminSubdomain}.localhost${port}${path}`
    }

    const labels = location.hostname.split('.')
    labels[0] = adminSubdomain
    return `${location.protocol}//${labels.join('.')}${port}${path}`
}
