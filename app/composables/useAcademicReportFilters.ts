// Shared filter state for every Academic Report tab page, kept in the URL query string so
// switching tabs (or reloading) never loses the current selection. No academic year field here on
// purpose - the backend already defaults to the school's active academic year when none is given,
// and the Term dropdown is pre-filtered to that year's terms, so there's nothing for the user to
// pick.
export function useAcademicReportFilters() {
  const route = useRoute()
  const router = useRouter()

  const academicYearStore = useAcademicYearStore()
  const termStore = useTermStore()
  const classStore = useClassStore()
  const subjectStore = useSubjectStore()

  const filters = reactive({
    termId: typeof route.query.termId === 'string' ? route.query.termId : '',
    level: typeof route.query.level === 'string' ? route.query.level : '',
    classId: typeof route.query.classId === 'string' ? route.query.classId : '',
    subjectId: typeof route.query.subjectId === 'string' ? route.query.subjectId : ''
  })

  const activeYearId = computed(() => academicYearStore.activeYear?.id || '')

  const terms = computed(() => termStore.records
    .filter(t => t.academicYear?.id === activeYearId.value)
    .map(t => ({ label: t.name, value: t.id })))

  const classOptions = computed(() => classStore.records.map(c => ({ label: c.name, value: c.id })))
  const subjectOptions = computed(() => subjectStore.records.map(s => ({ label: s.name, value: s.id })))

  // Backend Level enum is uppercase (PRIMARY/JSS/SSS) - kept local rather than reusing the
  // app-wide Level enum, whose values are mixed-case for display elsewhere.
  const levelOptions = [
    { label: 'Primary', value: 'PRIMARY' },
    { label: 'JSS', value: 'JSS' },
    { label: 'SSS', value: 'SSS' }
  ]

  const queryString = computed(() => {
    const q = new URLSearchParams()
    if (filters.termId) q.set('termId', filters.termId)
    if (filters.level) q.set('level', filters.level)
    if (filters.classId) q.set('classId', filters.classId)
    if (filters.subjectId) q.set('subjectId', filters.subjectId)
    return q.toString()
  })

  const apiFilters = computed(() => ({
    termId: filters.termId || undefined,
    level: filters.level || undefined,
    classId: filters.classId || undefined,
    subjectId: filters.subjectId || undefined
  }))

  watch(filters, () => {
    router.replace({ query: { ...route.query, ...apiFilters.value } })
  })

  async function ensureLoaded() {
    await academicYearStore.fetchAll(1, 100)
    await termStore.fetchAll(1, 100)

    if (!filters.termId) {
      const active = await termStore.getActive()
      filters.termId = active?.id || terms.value[0]?.value || ''
    }

    await Promise.all([
      classStore.fetchAll(1, 200),
      subjectStore.fetchAll(1, 200)
    ])
  }

  return {
    filters,
    terms,
    classOptions,
    subjectOptions,
    levelOptions,
    queryString,
    apiFilters,
    ensureLoaded,
    classStore,
    subjectStore,
    termStore
  }
}
