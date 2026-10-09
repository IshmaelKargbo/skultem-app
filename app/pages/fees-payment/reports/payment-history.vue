<template>
  <div class="space-y-4 px-4 md:px-6">
    <FeeReportSectionNav />

    <Heading title="Payment History" subtitle="Every school-fee payment recorded during a period.">
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

    <FilterBar :model-value="filters" :fields="filterFields" title="Filter payment history"
      description="Narrow by date, term, class, student or payment method"
      @update:model-value="Object.assign(filters, $event)" />

    <UCard v-if="loading">
      <div class="space-y-3">
        <USkeleton class="h-8 w-64" />
        <USkeleton v-for="i in 8" :key="i" class="h-8 w-full" />
      </div>
    </UCard>

    <template v-else-if="rows.length">
      <div id="payment-history-preview" class="rounded-lg bg-white px-2 text-gray-900">
        <div class="mb-4 border-b-4 border-primary-500 pb-5 pt-6 text-center sm:pt-8">
          <img v-if="logoSrc" :src="logoSrc" class="mx-auto size-40 object-contain" alt="School logo">
          <h2 class="text-xl font-black tracking-wide">{{ schoolName }}</h2>
          <p class="mt-1 text-sm font-semibold text-gray-600">Payment History</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Academic Year: {{ academicYearLabel }}</span>
            <span v-if="filters.termId">Term: {{ termLabel }}</span>
            <span v-if="filters.from || filters.to">Period: {{ filters.from || 'Start' }} – {{ filters.to || 'Today' }}</span>
            <span v-if="filters.classSessionId">Class: {{ classLabel }}</span>
            <span v-if="filters.method">Method: {{ parsePaymentMethod[filters.method] || filters.method }}</span>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="t in tiles" :key="t.label" class="rounded-xl bg-primary-50 p-3 text-center">
            <p class="text-xs text-gray-500">{{ t.label }}</p>
            <p class="text-lg font-bold text-primary-600">{{ t.value }}</p>
          </div>
        </div>

        <FeeReportInsightSection title="Key Insights" :items="insights" />

        <p class="mb-2 text-sm font-semibold text-gray-700">Total by Payment Method</p>
        <div class="mb-6 overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Method</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Payments</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Amount</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in byMethod" :key="m.method">
                <td class="border border-gray-200 p-2.5">{{ parsePaymentMethod[m.method] || m.method }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ m.count }}</td>
                <td class="border border-gray-200 p-2.5 text-right font-semibold">{{ format(m.amount) }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ m.share }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mb-2 text-sm font-semibold text-gray-700">Payments</p>
        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 p-2.5 text-center font-semibold">#</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Date</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Receipt</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Student</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Class</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Fee Type</th>
                <th class="border border-gray-200 p-2.5 text-center font-semibold">Method</th>
                <th class="border border-gray-200 p-2.5 text-left font-semibold">Recorded By</th>
                <th class="border border-gray-200 p-2.5 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in rows" :key="p.id">
                <td class="border border-gray-200 p-2.5 text-center">{{ i + 1 }}</td>
                <td class="border border-gray-200 p-2.5">{{ formatDate(p.paidAt) }}</td>
                <td class="border border-gray-200 p-2.5">{{ p.receiptNo || '—' }}</td>
                <td class="border border-gray-200 p-2.5">{{ p.studentName }}</td>
                <td class="border border-gray-200 p-2.5">{{ p.className }}</td>
                <td class="border border-gray-200 p-2.5">{{ p.feeCategoryName }}</td>
                <td class="border border-gray-200 p-2.5 text-center">{{ parsePaymentMethod[p.method] || p.method }}</td>
                <td class="border border-gray-200 p-2.5">{{ p.recordedBy || '—' }}</td>
                <td class="border border-gray-200 p-2.5 text-right font-semibold">{{ format(p.amount || 0) }}</td>
              </tr>
              <tr class="bg-gray-50 font-semibold">
                <td class="border border-gray-200 p-2.5" colspan="8">Total ({{ rows.length }} payments)</td>
                <td class="border border-gray-200 p-2.5 text-right">{{ format(total) }}</td>
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
        <UIcon name="i-lucide-receipt" class="mb-3 size-10 text-muted" />
        <p class="text-sm font-medium text-highlighted">No payments found for this filter.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const academicYearStore = useAcademicYearStore()
const termStore = useTermStore()
const classSessionStore = useClassSessionStore()
const { school } = useSchoolInfo()
const { logoSrc, loadLogo, ready: logoReady } = useReportLogo()
const { format } = useMoney()
const { success, error: toastError } = useNotify()

const filters = reactive({
  from: '',
  to: '',
  academicYearId: '',
  termId: '',
  classSessionId: '',
  studentId: '',
  method: '',
})

const rows = ref<FeePaymentRow[]>([])
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

const methodOptions = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank', value: 'BANK' },
  { label: 'Mobile Money', value: 'MOBILE_MONEY' },
]

const filterFields = computed(() => [
  { key: 'from', label: 'From', type: 'date' as const },
  { key: 'to', label: 'To', type: 'date' as const },
  { key: 'termId', label: 'Term', type: 'select' as const, options: terms.value, placeholder: 'Every term' },
  { key: 'classSessionId', label: 'Class', type: 'select' as const, options: classSessions.value, placeholder: 'Every class' },
  { key: 'studentId', label: 'Student', type: 'student' as const, placeholder: 'Every student' },
  { key: 'method', label: 'Payment Method', type: 'select' as const, options: methodOptions, placeholder: 'Every method' },
])

const schoolName = computed(() => school.value?.name || 'Skultem')
const generatedDate = computed(() => new Date().toLocaleDateString())
const academicYearLabel = computed(() =>
  academicYears.value.find(y => y.value === filters.academicYearId)?.label || academicYearStore.activeYear?.name || '—')
const termLabel = computed(() => terms.value.find(t => t.value === filters.termId)?.label || '—')
const classLabel = computed(() => classSessions.value.find(c => c.value === filters.classSessionId)?.label || '—')

const total = computed(() => rows.value.reduce((sum, p) => sum + (p.amount || 0), 0))

const byMethod = computed(() => {
  const map = new Map<string, { method: string; count: number; amount: number }>()
  for (const p of rows.value) {
    const entry = map.get(p.method) ?? { method: p.method, count: 0, amount: 0 }
    entry.count++
    entry.amount += p.amount || 0
    map.set(p.method, entry)
  }
  return [...map.values()]
    .sort((a, b) => b.amount - a.amount)
    .map(m => ({ ...m, share: total.value > 0 ? Math.round((m.amount / total.value) * 1000) / 10 : 0 }))
})

const tiles = computed(() => {
  const students = new Set(rows.value.map(p => p.studentId ?? p.studentName)).size
  return [
    { label: 'Total Collected', value: format(total.value) },
    { label: 'Payments', value: String(rows.value.length) },
    { label: 'Students Paid', value: String(students) },
    { label: 'Average Payment', value: format(rows.value.length ? total.value / rows.value.length : 0) },
  ]
})

// Plain derivations of the rows already on the page.
const insights = computed(() => {
  const list: { text: string; color: string }[] = []
  const top = byMethod.value[0]
  if (top) {
    list.push({
      text: `${parsePaymentMethod[top.method] || top.method} is the most used method, bringing in ${format(top.amount)} (${top.share}%).`,
      color: 'info',
    })
  }
  const biggest = [...rows.value].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0]
  if (biggest) {
    list.push({
      text: `The largest single payment was ${format(biggest.amount || 0)} from ${biggest.studentName}.`,
      color: 'success',
    })
  }
  return list
})

function buildFilters() {
  return {
    from: filters.from || undefined,
    to: filters.to || undefined,
    academicYearId: filters.academicYearId || undefined,
    termId: filters.termId || undefined,
    classSessionId: filters.classSessionId || undefined,
    studentId: filters.studentId || undefined,
    method: filters.method || undefined,
  }
}

// A report lists every payment matching the filters, so every page is fetched rather than paging on screen.
async function loadReport() {
  loading.value = true
  try {
    const all: FeePaymentRow[] = []
    for (let p = 1; ; p++) {
      const res = await FeeReportApi().getPaymentHistory(p, 500, buildFilters())
      if (!res) break
      all.push(...res.data)
      if (p >= (res.meta?.totalPages ?? 1) || !res.data.length) break
    }
    rows.value = all
  } catch (err: any) {
    toastError(err?.message || 'Failed to load payment history')
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
    await $generatePdf('#payment-history-preview', 'payment-history', { landscape: true })
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
    const { blob, filename } = await ReportApi().exportFeePaymentHistory('csv', buildFilters())
    downloadBlob(blob, filename)
    success('Report downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to export report')
  } finally {
    exporting.value = false
  }
}

watch([() => filters.from, () => filters.to, () => filters.termId, () => filters.classSessionId,
  () => filters.studentId, () => filters.method], loadReport)

onMounted(async () => {
  loadLogo() // not awaited - fetches in the background, doesn't block the report's own data

  useAppStore().setTitle('Payment History')
  document.title = 'Payment History | Skultem'

  await academicYearStore.fetchAll(1, 100)
  // Follows the year picked in the header, like the other fee reports.
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''
  await termStore.fetchAll(1, 100)
  await loadClasses()
  await loadReport()
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
