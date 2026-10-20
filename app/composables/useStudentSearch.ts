// Debounced, server-side searchable student picker. Swap-in replacement for the old
// `studentStore.fetchAll(0, 0)` + client-side USelectMenu filtering pattern, which pulled every
// student in the school into memory just to populate one dropdown - fine for a roster of a few
// hundred, a real payload/DOM problem past that. Pair with `ignore-filter` on USelectMenu (search
// now happens server-side via the `search` param, not client-side over a fully loaded list).
//
// `selected` returns the id(s) currently chosen. The list is replaced on every search, so without it a student you
// picked drops out of the options the moment the search resets, and the menu falls back to showing the raw id. Names
// seen so far are remembered, and a chosen student missing from the current results is kept in the options.
export function useStudentSearch(pageSize = 25, selected?: () => (string | null | undefined)[]) {
    const store = useStudentStore()
    const searchTerm = ref('')
    const searching = ref(false)

    const names = reactive<Record<string, string>>({})
    watch(() => store.records, (records) => {
        for (const s of records ?? []) names[s.id] = `${s.givenNames} ${s.familyName}`
    }, { immediate: true })

    const students = computed(() => {
        const found = (store.records ?? []).map(s => ({ label: `${s.givenNames} ${s.familyName}`, value: s.id }))
        const missing = (selected?.() ?? [])
            .filter((id): id is string => !!id && !found.some(s => s.value === id) && !!names[id])
            .map(id => ({ label: names[id]!, value: id }))
        return [...missing, ...found]
    })

    async function runSearch(term: string) {
        searching.value = true
        try {
            await store.fetchAll(1, pageSize, term)
        } finally {
            searching.value = false
        }
    }

    let debounceTimer: ReturnType<typeof setTimeout>

    watch(searchTerm, (term) => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => runSearch(term), 300)
    })

    onMounted(() => runSearch(''))

    return {
        searchTerm,
        students,
        loading: computed(() => searching.value || store.loading)
    }
}
