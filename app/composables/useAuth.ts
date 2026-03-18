export function useAuth() {
    const userStore = useUserStore()
    const activeRole = useState<string>('active-role', () => '')

    function setActiveRole(role: string) {
        if (userStore.user?.roles?.includes(role)) {
            activeRole.value = role
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

    return { activeRole, setActiveRole, hasRole, can }
}