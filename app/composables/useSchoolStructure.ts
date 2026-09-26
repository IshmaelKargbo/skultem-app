// The active school's structure (offered levels + management sections), fetched once and shared
// app-wide via useState - class forms, report filters and the timetable all ask "which levels does
// this school have?" and shouldn't each hit the API. Call load() where it's needed (idempotent);
// load(true) after the structure is edited so every consumer picks up the change.
// Module-level so several components mounting at once share one request.
let inflight: Promise<SchoolStructure | null> | null = null

export function useSchoolStructure() {
    const structure = useState<SchoolStructure | null>('school-structure', () => null)
    const loading = useState<boolean>('school-structure-loading', () => false)

    async function load(force = false): Promise<SchoolStructure | null> {
        if (structure.value && !force) return structure.value
        if (inflight) return inflight

        loading.value = true
        inflight = SchoolApi().getStructure()
            .then(res => {
                structure.value = res ?? null
                return structure.value
            })
            .catch(() => structure.value)
            .finally(() => {
                loading.value = false
                inflight = null
            })
        return inflight
    }

    function set(value: SchoolStructure) {
        structure.value = value
    }

    // Offered levels, youngest to oldest. Until the structure has loaded (or if it can't be read by
    // this role) fall back to the full catalog rather than an empty picker.
    const offeredLevels = computed<LevelInfo[]>(() => {
        const offered = structure.value?.levels.map(l => l.level)
        if (!offered?.length) return LEVEL_CATALOG
        return LEVEL_CATALOG.filter(l => offered.includes(l.value))
    })

    // { label, value } items for USelect/USelectMenu. value is widened to string so it binds to the
    // plain-string v-models existing forms and filters use (with '' meaning "none").
    const levelOptions = computed(() => offeredLevels.value.map(l => ({ label: l.label, value: l.value as string })))

    const isSectionBased = computed(() => structure.value?.managementModel === 'SECTION_BASED')

    // The school's management sections, e.g. "Primary" / "Secondary" - what a scopable staff
    // member (Admin/Accountant/Teacher) is limited to. Empty in a UNIFIED school.
    const sectionOptions = computed(() => (structure.value?.sections ?? []).map(s => ({
        label: s.name,
        value: s.id,
        description: s.levels.map(levelLabel).join(' • ')
    })))

    // "Primary School" for a management section id; '' for null/whole school or an unknown id.
    function sectionName(id?: string | null): string {
        if (!id) return ''
        return structure.value?.sections.find(s => s.id === id)?.name ?? ''
    }

    return { structure, loading, load, set, offeredLevels, levelOptions, isSectionBased, sectionOptions, sectionName }
}
