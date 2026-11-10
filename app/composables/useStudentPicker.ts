// A student picker over every student on file (any year, any status except deleted) - for screens like taking
// a payment, where someone who owes from last year, or has left, must still be found. Searches the server as you
// type and loads more as you ask, so a big school never downloads its whole roster.

export type StudentPickerRow = { id: string, name: string, admissionNumber?: string | null, className?: string | null, status?: string | null }
type PickerOption = { label: string, value: string, description?: string }

export function useStudentPicker(pageSize = 50, selected?: () => (string | null | undefined)[]) {
  const searchTerm = ref('')
  const loading = ref(false)
  const rows = ref<StudentPickerRow[]>([])
  const page = ref(1)
  const total = ref(0)
  // Names seen so far, so a chosen student stays labelled after the search changes.
  const known = reactive<Record<string, PickerOption>>({})

  const toOption = (r: StudentPickerRow): PickerOption => {
    const parts = [r.admissionNumber, r.className]
    if (r.status && r.status !== 'ACTIVE') parts.push(r.status.charAt(0) + r.status.slice(1).toLowerCase())
    return { label: r.name, value: r.id, description: parts.filter(Boolean).join(' · ') || undefined }
  }

  const students = computed(() => {
    const found = rows.value.map(toOption)
    const missing = (selected?.() ?? [])
      .filter((id): id is string => !!id && !found.some(o => o.value === id) && !!known[id])
      .map(id => known[id]!)
    return [...missing, ...found]
  })

  const hasMore = computed(() => rows.value.length < total.value)

  let latest = 0
  async function load(reset: boolean) {
    const request = ++latest
    loading.value = true
    try {
      const next = reset ? 1 : page.value + 1
      const res = await fetchPage(searchTerm.value.trim(), next)
      if (request !== latest || !res) return
      for (const r of res.data) known[r.id] = toOption(r)
      rows.value = reset ? res.data : [...rows.value, ...res.data.filter(r => !rows.value.some(x => x.id === r.id))]
      page.value = next
      // The server sends the number of matching students as meta.count.
      const meta = res.meta as any
      total.value = Number(meta?.count ?? meta?.total ?? rows.value.length)
    } finally {
      if (request === latest) loading.value = false
    }
  }

  // A server without /student/picker yet (not restarted after the update): use the regular student search
  // instead, so the field still works - it only finds students enrolled this year.
  let useFallback = false
  async function fetchPage(term: string, pageNo: number) {
    if (!useFallback) {
      try {
        return await StudentApi().picker(term, pageNo, pageSize)
      } catch {
        useFallback = true
      }
    }
    const res = await StudentApi().getAll(term, pageNo, pageSize) as any
    const data: StudentPickerRow[] = (res?.data ?? []).map((st: any) => ({
      id: st.id,
      name: `${st.givenNames ?? ''} ${st.familyName ?? ''}`.trim(),
      admissionNumber: st.admissionNumber,
      className: st.enrollment?.className ?? st.className ?? null,
      status: st.status,
    }))
    return { data, meta: res?.meta }
  }

  let timer: ReturnType<typeof setTimeout>
  watch(searchTerm, () => {
    clearTimeout(timer)
    timer = setTimeout(() => load(true), 300)
  })

  // Remember a student chosen elsewhere (e.g. opened from their profile) so it shows by name.
  function remember(row: StudentPickerRow) {
    known[row.id] = toOption(row)
  }

  onMounted(() => load(true))

  return { searchTerm, students, loading, hasMore, total, loadMore: () => load(false), remember }
}
