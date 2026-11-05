// The library is split by management section (backend: LibrarySectionAccess): every book belongs to one, and staff
// limited to sections only see and manage their sections' books. This gives the sections the signed-in person can
// use - every section for whole-school staff, just their own otherwise - for the book form and the list filters.
export function useLibrarySections() {
    const { structure, load: loadStructure, isSectionBased } = useSchoolStructure()
    const { scope, load: loadScope } = useMyScope()

    const options = computed(() => {
        const all = structure.value?.sections ?? []
        const mine = !scope.value || scope.value.wholeSchool
            ? all
            : all.filter(s => s.id && scope.value!.sectionIds.includes(s.id))
        return mine.filter(s => !!s.id).map(s => ({ label: s.name, value: s.id as string }))
    })

    // A school run by sections needs a section on every book.
    const required = computed(() => isSectionBased.value && (structure.value?.sections.length ?? 0) > 0)
    // Worth showing (a column, a filter, a picker) only when there's more than one to tell apart.
    const showSections = computed(() => required.value && options.value.length > 1)

    function nameOf(id: string | null | undefined) {
        if (!id) return null
        return structure.value?.sections.find(s => s.id === id)?.name ?? null
    }

    function load() {
        return Promise.all([loadStructure(), loadScope()])
    }

    return { options, required, showSections, nameOf, load }
}
