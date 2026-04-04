export function useAuth() {
    const userStore = useUserStore()
    const activeRole = useState<string>('active-role', () => '')

    // ✅ Rehydrate from localStorage once on client mount
    if (import.meta.client) {
        const cached = localStorage.getItem('active-role')
        if (cached) activeRole.value = cached
    }

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

        // ✅ Only touch localStorage on client
        if (import.meta.client) {
            const cached = localStorage.getItem('active-role')
            if (cached && user.roles?.includes(cached)) {
                activeRole.value = cached
            } else {
                activeRole.value = user.roles?.[0] ?? ''
            }
        } else {
            // ✅ Server: just use first role, don't touch localStorage
            activeRole.value = user.roles?.[0] ?? ''
        }
    }, { immediate: true })

    return { activeRole, setActiveRole, clearRole, hasRole, can }
}