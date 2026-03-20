export function useAuth() {
    const userStore = useUserStore()
    const activeRole = useState<string>('active-role', () => '')

    function setActiveRole(role: string) {
        activeRole.value = role
        if (import.meta.client) {
            localStorage.setItem('active-role', role)
        }
    }

    function clearRole() {
        activeRole.value = ''
        if (import.meta.client) {
            localStorage.removeItem('active-role')
        }
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

    watch(() => userStore.user, (user) => {
        if (!user) {
            clearRole()
            return
        }
        const cached = import.meta.client ? localStorage.getItem('active-role') : null
        if (cached && user.roles?.includes(cached)) {
            activeRole.value = cached
        } else {
            activeRole.value = user.roles?.[0] ?? ''
        }
    }, { immediate: true })

    return { activeRole, setActiveRole, clearRole, hasRole, can }
}