<template>
  <div class="space-y-4 px-4 md:px-6">
    <FeeReportSectionNav />

    <Heading title="Student Balances" subtitle="Every student's current fee position, without opening them one by one.">
      <div class="flex gap-2">
        <UButton icon="i-lucide-download" color="primary" class="justify-center" :loading="downloading"
          :disabled="!rows.length" @click="downloadPdf">
          Export PDF
        </UButton>
        <UButton icon="i-lucide-file-spreadsheet" color="neutral" variant="soft" class="justify-center"
          :loading="exporting" @click="exportCsv">
          Export CSV
        </UButton>
      </div>
    </Heading>

    <FilterBar :model-value="drawerModel" :fields="filterFields" title="Filter student balances"
      description="Narrow by term, class, status, fee type or balance range" @update:model-value="applyDrawer" />

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 8" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <template v-else-if="rows.length">
      <div id="student-balances-preview" class="rounded-lg bg-white px-2 text-gray-900">
        <div class="mb-4 border-b-4 border-primary-500 pb-5 pt-6 text-center sm:pt-8">
          <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
          <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
          <p class="mt-1 text-sm font-semibold text-gray-600">Student Fee Balances</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Academic Year: {{ academicYearLabel }}</span>
            <span>Term: {{ termLabel }}</span>
            <span v-if="filters.classSessionId">Class: {{ classLabel }}</span>
            <span v-if="filters.status">Status: {{ parseFeeCollectionStatus[filters.status] }}</span>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="t in tiles" :key="t.label" class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">{{ t.label }}</p>
            <p class="text-lg font-bold text-primary-600">{{ t.value }}</p>
          </div>
        </div>

        <FeeReportInsightSection title="Key Insights" :items="insights" />

        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-center font-semibold">#</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Admission No.</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Expected</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Paid</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Balance</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in rows" :key="s.studentId" :class="s.balance > 0 ? 'bg-red-50' : ''">
                <td class="border border-gray-200 p-2.5 text-center">{{ i + 1 }}</td>
                <td class="border border-gray-200 p-2.5">{{ s.studentName }}</td>
                <td class="border border-gray-200 p-2.5">{{ s.admissionNumber }}</td>
                <td class="border border-gray-200 p-2.5">{{ s.className }}</td>
                <td class="border border-gray-200 p-2.5 text-right">{{ format(s.expected) }}</td>
                <td class="border border-gray-200 p-2.5 text-right">{{ format(s.paid) }}</td>
                <td class="border border-gray-200 p-2.5 text-right font-semibold"
                  :class="s.balance > 0 ? 'text-red-600' : 'text-gray-700'">{{ format(s.balance) }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ parseFeeCollectionStatus[s.status] }}</td>
              </tr>
              <tr class="bg-gray-50 font-semibold">
                <td class="border border-gray-200 p-2.5" colspan="4">Total ({{ rows.length }} students)</td>
                <td class="border border-gray-200 p-2.5 text-right">{{ format(totals.expected) }}</td>
                <td class="border border-gray-200 p-2.5 text-right">{{ format(totals.paid) }}</td>
                <td class="border border-gray-200 p-2.5 text-right">{{ format(totals.balance) }}</td>
                <td class="border border-gray-200 p-2.5" />
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-6 text-center text-[10px] uppercase tracking-widest text-gray-300">
          Generated by Skultem &middot; {{ generatedDate }}
        </p>
      </div>
    </template>

    <UCard v-else>
      <div class="flex flex-col items-center justify-center py-14 text-center">
        <UIcon name="i-lucide-users" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No students found for this filter.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const termStore = useTermStore()
const classSessionStore = useClassSessionStore()
const feeStore = useFeeStore()
const { school } = useSchoolInfo()
const { logoSrc, loadLogo, ready: logoReady } = useReportLogo()
const { format } = useMoney()
const { success, error: toastError } = useNotify()

const filters = reactive({
  academicYearId: '',
  termId: '',
  classSessionId: '',
  status: '',
  feeCategoryId: '',
  balanceMin: '',
  balanceMax: '',
})

const sortOptions = [
  { label: 'Highest Balance', value: 'BALANCE:desc' },
  { label: 'Lowest Balance', value: 'BALANCE:asc' },
  { label: 'Name (A-Z)', value: 'NAME:asc' },
  { label: 'Name (Z-A)', value: 'NAME:desc' },
  { label: 'Class', value: 'CLASS:asc' },
]
const DEFAULT_SORT = 'BALANCE:desc'
const sortBy = ref(DEFAULT_SORT)

const statusOptions = [
  { label: 'Paid', value: 'PAID' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
  { label: 'No Payment', value: 'NO_PAYMENT' },
]

const rows = ref<StudentFeeBalance[]>([])
const loading = ref(true)
const downloading = ref(false)
const exporting = ref(false)
const localClassSessions = ref<ClassSession[]>([])

const academicYears = computed(() => academicYearStore.list)
const terms = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))
const classSessions = computed(() => localClassSessions.value.map(e => {
  let label = `${e.clazz} (${e.sectionName})`
  if (e.streamName !== 'N/A') label += ` - ${e.streamName}`
  return { label, value: e.id }
}))
const feeCategories = computed(() => feeStore.records.map(c => ({ label: c.name, value: c.id })))

const schoolName = computed(() => school.value?.name || 'Skultem')
const generatedDate = computed(() => new Date().toLocaleDateString())
const academicYearLabel = computed(() =>
  academicYears.value.find(y => y.value === filters.academicYearId)?.label || academicYearStore.activeYear?.name || '—')
const termLabel = computed(() => terms.value.find(t => t.value === filters.termId)?.label || 'Whole Year')
const classLabel = computed(() => classSessions.value.find(c => c.value === filters.classSessionId)?.label || '—')

const totals = computed(() => rows.value.reduce(
  (t, s) => ({ expected: t.expected + s.expected, paid: t.paid + s.paid, balance: t.balance + s.balance }),
  { expected: 0, paid: 0, balance: 0 }))

const tiles = computed(() => [
  { label: 'Students', value: String(rows.value.length) },
  { label: 'Expected', value: format(totals.value.expected) },
  { label: 'Paid', value: format(totals.value.paid) },
  { label: 'Outstanding', value: format(totals.value.balance) },
])

// Plain derivations of the rows already on the page.
const insights = computed(() => {
  const list: { text: string; color: string }[] = []
  const owing = rows.value.filter(s => s.balance > 0)
  const none = rows.value.filter(s => s.status === 'NO_PAYMENT')
  if (!rows.value.length) return list

  if (owing.length) {
    const top = [...owing].sort((a, b) => b.balance - a.balance)[0]!
    list.push({
      text: `${owing.length} of ${rows.value.length} students still owe a balance; ${top.studentName} owes the most at ${format(top.balance)}.`,
      color: 'warning',
    })
  } else {
    list.push({ text: 'Every student listed has paid in full.', color: 'success' })
  }
  if (none.length) {
    list.push({
      text: `${none.length} student${none.length === 1 ? ' has' : 's have'} made no payment at all yet.`,
      color: 'error',
    })
  }
  return list
})

// The drawer edits the filters and the sort order as one object.
const drawerModel = computed(() => ({ ...filters, sortBy: sortBy.value }))

function applyDrawer(value: Record<string, string>) {
  const { sortBy: nextSort, ...rest } = value
  Object.assign(filters, rest)
  sortBy.value = nextSort || DEFAULT_SORT
}

const filterFields = computed(() => [
  { key: 'termId', label: 'Term', type: 'select' as const, options: terms.value, placeholder: 'Whole year' },
  { key: 'classSessionId', label: 'Class', type: 'select' as const, options: classSessions.value, placeholder: 'Every class' },
  { key: 'status', label: 'Payment Status', type: 'select' as const, options: statusOptions, placeholder: 'Every status' },
  { key: 'feeCategoryId', label: 'Fee Type', type: 'select' as const, options: feeCategories.value, placeholder: 'Every fee type' },
  { key: 'balanceMin', label: 'Min Balance', type: 'number' as const, placeholder: '0' },
  { key: 'balanceMax', label: 'Max Balance', type: 'number' as const, placeholder: 'Any' },
  { key: 'sortBy', label: 'Sort by', type: 'select' as const, options: sortOptions, default: DEFAULT_SORT, required: true },
])

// A report lists everyone matching the filters, so every page is fetched rather than paging on screen.
async function loadReport() {
  loading.value = true
  try {
    const [sortField, sortDirection] = sortBy.value.split(':')
    const all: StudentFeeBalance[] = []
    for (let p = 1; ; p++) {
      const res = await FeeReportApi().getStudentBalances(p, 500, {
        academicYearId: filters.academicYearId || undefined,
        termId: filters.termId || undefined,
        classSessionId: filters.classSessionId || undefined,
        status: filters.status || undefined,
        feeCategoryId: filters.feeCategoryId || undefined,
        balanceMin: filters.balanceMin || undefined,
        balanceMax: filters.balanceMax || undefined,
        sortBy: sortField,
        direction: sortDirection,
      })
      if (!res) break
      all.push(...res.data)
      if (p >= (res.meta?.totalPages ?? 1) || !res.data.length) break
    }
    rows.value = all
  } catch (err: any) {
    toastError(err?.message || 'Failed to load student balances')
  } finally {
    loading.value = false
  }
}

async function loadClasses() {
  await classSessionStore.fetchAll(1, 200, filters.academicYearId || undefined)
  localClassSessions.value = classSessionStore.records
}

async function downloadPdf() {
  if (!rows.value.length) return
  downloading.value = true
  try {
    await logoReady() // the print-safe logo must be in before the PDF is drawn
    const { $generatePdf } = useNuxtApp()
    await $generatePdf('#student-balances-preview',
      `student-fee-balances-${termLabel.value}`.replace(/[^a-z0-9-_]/gi, '-'), { landscape: true })
    success('Report downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    const { blob, filename } = await ReportApi().exportStudentFeeBalances('csv', {
      academicYearId: filters.academicYearId || undefined,
      termId: filters.termId || undefined,
      classSessionId: filters.classSessionId || undefined,
      status: filters.status || undefined,
      feeCategoryId: filters.feeCategoryId || undefined,
    })
    downloadBlob(blob, filename)
    success('Report downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to export report')
  } finally {
    exporting.value = false
  }
}

watch([() => filters.termId, () => filters.classSessionId, () => filters.status, () => filters.feeCategoryId,
  () => filters.balanceMin, () => filters.balanceMax, sortBy], loadReport)

onMounted(async () => {
  loadLogo() // not awaited - fetches in the background, doesn't block the report's own data

  useAppStore().setTitle('Student Balances')
  document.title = 'Student Balances | Skultem'

  await academicYearStore.fetchAll(1, 100)
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await termStore.fetchAll(1, 100)
  await feeStore.fetchAll(1, 100)
  await loadClasses()
  await loadReport()
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
