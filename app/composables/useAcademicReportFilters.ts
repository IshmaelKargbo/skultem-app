// Shared filter state for every Academic Report tab page, kept in the URL query string so
// switching tabs (or reloading) never loses the current selection. There's no academic year field
// here on purpose: the year is whichever one the header's switcher is showing (its viewing year),
// so the Term dropdown lists that year's terms and every report request is sent for that year. A term
// carried over in the URL from a different year is dropped rather than sent - a term only exists
// within its own year, so that combination would fail with "Term not found".
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

  // The year being looked at: the switcher's pick, falling back to the school's active year.
  const yearId = computed(() => academicYearStore.viewingYear?.id || '')

  const terms = computed(() => termStore.records
    .filter(t => t.academicYear?.id === yearId.value)
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

  // What's kept in the URL - the year is deliberately not part of it (the switcher owns that).
  const urlFilters = computed(() => ({
    termId: filters.termId || undefined,
    level: filters.level || undefined,
    classId: filters.classId || undefined,
    subjectId: filters.subjectId || undefined
  }))

  // What every report request is sent with: the selection plus the year it belongs to.
  const apiFilters = computed(() => ({
    ...urlFilters.value,
    academicYearId: yearId.value || undefined
  }))

  watch(filters, () => {
    router.replace({ query: { ...route.query, ...urlFilters.value } })
  })

  // The term to open on: the school's active term when the year being viewed is the active year;
  // any other year has no active term, so its most recent one.
  async function defaultTermId() {
    const active = await termStore.getActive()
    if (active && terms.value.some(t => t.value === active.id)) return active.id

    const latest = termStore.records
      .filter(t => t.academicYear?.id === yearId.value)
      .sort((a, b) => b.termNumber - a.termNumber)[0]

    return latest?.id || ''
  }

  async function ensureLoaded() {
    await academicYearStore.fetchAll(1, 100)
    await termStore.fetchAll(1, 100)

    // A term from the URL that isn't in the year being viewed (the year was switched, or the link was
    // opened under another year) would only fail - start over from a sensible one instead.
    if (filters.termId && !terms.value.some(t => t.value === filters.termId)) {
      filters.termId = ''
    }

    if (!filters.termId) {
      filters.termId = await defaultTermId()
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
