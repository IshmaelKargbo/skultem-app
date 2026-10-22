// The signed-in user's own effective management-section scope, fetched once and shared app-wide
// via useState. Forms that create something the backend scopes (like Add Class - see
// SectionScopeGuard#level) should offer only these levels, not every level the school offers,
// since a scoped Admin/Accountant/Teacher would just get a 403 picking one outside their section.
// Call load() where it's needed (idempotent); load(true) to force a refresh (e.g. after a role/
// section change). Module-level so several components mounting at once share one request.
let inflight: Promise<MyScope | null> | null = null
let inflightKey = ''

export function useMyScope() {
    const scope = useState<MyScope | null>('my-scope', () => null)
    const loading = useState<boolean>('my-scope-loading', () => false)
    // Who the cached scope belongs to - it's per user AND per active role, so a logout/login or a
    // role switch without a page reload must refetch instead of reusing the previous identity's scope
    // (e.g. a section Admin's narrowed scope hiding every other Settings tab from the Owner).
    const scopeKey = useState<string>('my-scope-key', () => '')
    const { activeRole } = useAuth()
    const currentKey = () => `${useUserStore().user?.email ?? ''}:${activeRole.value}`

    async function load(force = false): Promise<MyScope | null> {
        const key = currentKey()
        if (scopeKey.value !== key) scope.value = null
        if (scope.value && !force) return scope.value
        if (inflight && inflightKey === key) return inflight

        loading.value = true
        const request = useUserStore().getMyScope()
            .then(res => {
                // A newer load (another role) took over while this one was in flight - drop it.
                if (inflight !== request) return scope.value
                scope.value = res ?? null
                scopeKey.value = key
                return scope.value
            })
            .catch(() => scope.value)
            .finally(() => {
                if (inflight !== request) return
                loading.value = false
                inflight = null
            })
        inflight = request
        inflightKey = key
        return request
    }

    // Narrows a school-wide { label, value } level option list down to the levels this user can
    // actually use - a no-op for whole-school staff (owner, or nobody scoped).
    function restrict<T extends { value: string }>(options: T[]): T[] {
        if (!scope.value || scope.value.wholeSchool) return options
        return options.filter(o => scope.value!.levels.includes(o.value as LevelCode))
    }

    return { scope, loading, load, restrict }
}
