// The owner-level "view one section" choice: an owner / proprietor (or super admin) of a school run in
// management sections can look at the whole school or at just one section (Primary, Secondary, ...), and
// lists, reports and dashboards narrow to it. It is only a view - what they may DO is unchanged - and it is
// sent to the server on every request (plugins/api.ts) as X-View-Section, where SectionScopeService#view
// applies it. Kept in a cookie so it survives a refresh, and switching reloads the page (like the academic
// year switcher) so everything on screen is fetched again through the filter.
export function useSectionView() {
    const cookie = useCookie<string | null>('viewing_section_id', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    const { structure, load, isSectionBased } = useSchoolStructure()
    const { can } = useAuth()

    // Owner / proprietor (super admin is covered by roleAllows) - and only where there are sections to pick.
    const canSwitch = computed(() => can([Role.OWNER, Role.PROPRIETOR]) && isSectionBased.value
        && (structure.value?.sections.length ?? 0) > 0)

    const sections = computed(() => structure.value?.sections ?? [])

    // The section being viewed, or null for the whole school. A stale id (section since removed, another
    // school's, or a role that can't switch) counts as the whole school.
    const viewingSectionId = computed<string | null>(() => {
        const id = cookie.value
        if (!id || !canSwitch.value) return null
        return sections.value.some(s => s.id === id) ? id : null
    })

    const viewingSection = computed(() => sections.value.find(s => s.id === viewingSectionId.value) ?? null)

    function setViewingSection(id: string | null) {
        if ((cookie.value || null) === (id || null)) return
        cookie.value = id
        if (import.meta.client) nextTick(() => window.location.reload())
    }

    onMounted(() => { load() })

    return { canSwitch, sections, viewingSectionId, viewingSection, setViewingSection }
}
