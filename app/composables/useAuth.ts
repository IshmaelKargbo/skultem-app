export function useAuth() {
    const userStore = useUserStore()
    const roleCookie = useCookie<string | null>('active_role', {
        default: () => null,
        sameSite: 'lax'
    })
    const activeRole = useState<string>('active-role', () => roleCookie.value ?? '')
    const authResolved = useState<boolean>('auth-resolved', () => false)

    function resolveRole(user?: User | null) {
        if (!user?.roles?.length) return ''
        const preferredRole = roleCookie.value
        if (preferredRole && user.roles.includes(preferredRole)) {
            return preferredRole
        }
        return user.roles[0] ?? ''
    }

    function syncRole(role: string) {
        activeRole.value = role
        roleCookie.value = role || null
    }

    function setActiveRole(role: string) {
        syncRole(role)
    }

    function clearRole() {
        syncRole('')
    }

    function hasRole(role: string | string[]) {
        if (Array.isArray(role)) {
            return role.includes(activeRole.value)
        }
        return activeRole.value === role
    }

    function can(role: string | string[]) {
        return hasRole(role)
    }

    function initializeActiveRole() {
        syncRole(resolveRole(userStore.user))
    }

    function setAuthResolved(value: boolean) {
        authResolved.value = value
    }

    watch(() => userStore.user, (user) => {
        if (!user?.email) {
            clearRole()
            return
        }

        syncRole(resolveRole(user))
    }, { immediate: true })

    return { activeRole, authResolved, setActiveRole, clearRole, hasRole, can, initializeActiveRole, setAuthResolved }
}
