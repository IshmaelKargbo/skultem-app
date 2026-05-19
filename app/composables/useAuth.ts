export function useAuth() {
    const userStore = useUserStore()

    const roleCookie = useCookie<string | null>('active_role', {
        default: () => null,
        sameSite: 'lax'
    })

    const activeRole = useState<string>('active-role', () => '')
    const authResolved = useState<boolean>('auth-resolved', () => false)

    function resolveRole(user?: User | null) {
        if (!user?.roles?.length) return ''

        const cookieRole = roleCookie.value

        if (cookieRole && user.roles.includes(cookieRole)) {
            return cookieRole
        }

        return user.roles[0] ?? ''
    }

    function syncRole(role: string) {
        activeRole.value = role
        roleCookie.value = role || null
    }

    function setActiveRole(role: string) {
        if (!role) return
        syncRole(role)
    }

    function clearRole() {
        activeRole.value = ''
        roleCookie.value = null
    }

    function hasRole(role: string | string[]) {
        return Array.isArray(role)
            ? role.includes(activeRole.value)
            : activeRole.value === role
    }

    function can(role: string | string[]) {
        return hasRole(role)
    }

    function initializeActiveRole() {
        const user = userStore.user
        if (!user?.email) return

        const resolved = resolveRole(user)

        if (resolved) {
            activeRole.value = resolved
        }
    }

    function setAuthResolved(value: boolean) {
        authResolved.value = value
    }

    watch(
        () => userStore.user,
        (user) => {
            if (!user?.email) {
                clearRole()
                return
            }

            const resolved = resolveRole(user)

            if (resolved && resolved !== activeRole.value) {
                activeRole.value = resolved
                roleCookie.value = resolved
            }
        }
    )

    return {
        activeRole,
        authResolved,
        setActiveRole,
        clearRole,
        hasRole,
        can,
        initializeActiveRole,
        setAuthResolved
    }
}