// Debounced, server-side searchable student picker. Swap-in replacement for the old
// `studentStore.fetchAll(0, 0)` + client-side USelectMenu filtering pattern, which pulled every
// student in the school into memory just to populate one dropdown - fine for a roster of a few
// hundred, a real payload/DOM problem past that. Pair with `ignore-filter` on USelectMenu (search
// now happens server-side via the `search` param, not client-side over a fully loaded list).
export function useStudentSearch(pageSize = 25) {
    const store = useStudentStore()
    const searchTerm = ref('')
    const searching = ref(false)

    const students = computed(() =>
        store.records.map(s => ({
            label: `${s.givenNames} ${s.familyName}`,
            value: s.id
        }))
    )

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
