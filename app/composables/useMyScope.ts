// The signed-in user's own effective management-section scope, fetched once and shared app-wide
// via useState. Forms that create something the backend scopes (like Add Class - see
// SectionScopeGuard#level) should offer only these levels, not every level the school offers,
// since a scoped Admin/Accountant/Teacher would just get a 403 picking one outside their section.
// Call load() where it's needed (idempotent); load(true) to force a refresh (e.g. after a role/
// section change). Module-level so several components mounting at once share one request.
let inflight: Promise<MyScope | null> | null = null

export function useMyScope() {
    const scope = useState<MyScope | null>('my-scope', () => null)
    const loading = useState<boolean>('my-scope-loading', () => false)

    async function load(force = false): Promise<MyScope | null> {
        if (scope.value && !force) return scope.value
        if (inflight) return inflight

        loading.value = true
        inflight = useUserStore().getMyScope()
            .then(res => {
                scope.value = res ?? null
                return scope.value
            })
            .catch(() => scope.value)
            .finally(() => {
                loading.value = false
                inflight = null
            })
        return inflight
    }

    // Narrows a school-wide { label, value } level option list down to the levels this user can
    // actually use - a no-op for whole-school staff (owner, or nobody scoped).
    function restrict<T extends { value: string }>(options: T[]): T[] {
        if (!scope.value || scope.value.wholeSchool) return options
        return options.filter(o => scope.value!.levels.includes(o.value as LevelCode))
    }

    return { scope, loading, load, restrict }
}
