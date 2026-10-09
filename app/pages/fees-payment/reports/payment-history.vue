<template>
  <div class="px-4 sm:px-6 space-y-4">
    <FeeReportSectionNav />

    <Heading title="Payment History" subtitle="Every school-fee payment recorded during a period.">
      <UButton icon="i-lucide-download" color="primary" class="justify-center"
        :loading="exporting" @click="exportReport">
        Export CSV
      </UButton>
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <div>
            <p>Payments</p>
            <p class="text-xs text-muted">Every school-fee payment recorded in the period</p>
          </div>
          <div class="flex items-center gap-2">
            <TableViewToggle v-model="view" />
            <FilterDrawer :model-value="filters" :fields="filterFields" title="Filter payment history"
              description="Narrow by date, year, term, class, student or payment method"
              @update:model-value="Object.assign(filters, $event)" />
          </div>
        </div>
      </template>

      <!-- Desktop table -->
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="records" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No payments found.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #paidAt-cell="{ row }">
          <p class="text-xs text-muted">{{ formatDate(row.original.paidAt) }}</p>
        </template>
        <template #receiptNo-cell="{ row }">
          <p class="font-mono text-xs text-muted">{{ row.original.receiptNo || '—' }}</p>
        </template>
        <template #studentName-cell="{ row }">
          <div class="space-y-1">
            <p class="font-medium">{{ row.original.studentName }}</p>
            <p class="text-xs text-muted">{{ row.original.className }}</p>
          </div>
        </template>
        <template #feeCategoryName-cell="{ row }">
          <p class="text-muted">{{ row.original.feeCategoryName }}</p>
        </template>
        <template #method-cell="{ row }">
          <UBadge :icon="CREDIT_ICON" color="success" variant="subtle"
            :label="parsePaymentMethod[row.original.method] || row.original.method" />
        </template>
        <template #recordedBy-cell="{ row }">
          <p class="text-muted">{{ row.original.recordedBy || '—' }}</p>
        </template>
        <template #amount-cell="{ row }">
          <p class="font-semibold text-success">+ {{ format(row.original.amount || 0) }}</p>
        </template>
      </UTable>

      <!-- Mobile list: one clean row per payment -->
      <div v-if="view === 'table'" class="md:hidden">
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="border-b border-default px-4 py-3 last:border-0">
            <div class="flex items-center justify-between gap-3">
              <div class="space-y-2">
                <USkeleton class="h-4 w-28" />
                <USkeleton class="h-3 w-36" />
              </div>
              <div class="space-y-2">
                <USkeleton class="h-4 w-20" />
                <USkeleton class="ml-auto h-3 w-16" />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="records.length">
          <div v-for="item in records" :key="item.id"
            class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
            <div class="min-w-0 space-y-1">
              <p class="truncate text-sm font-semibold text-highlighted">{{ item.studentName }}</p>
              <div class="flex items-center gap-2 text-xs text-muted">
                <p class="truncate">{{ item.className }} · {{ item.feeCategoryName }}</p>
                <p>·</p>
                <p class="shrink-0">{{ formatDate(item.paidAt) }}</p>
              </div>
            </div>

            <div class="shrink-0 space-y-1 text-right">
              <p class="text-sm font-bold text-success">+ {{ format(item.amount || 0) }}</p>
              <p class="text-xs text-muted">{{ parsePaymentMethod[item.method] || item.method }}</p>
            </div>
          </div>
        </template>

        <div v-else class="flex flex-col items-center gap-2 py-12">
          <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">No payments found.</p>
        </div>
      </div>

      <!-- Card view -->
      <div v-if="view === 'card'" class="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 lg:grid-cols-3">
        <template v-if="loading">
          <UCard v-for="i in 6" :key="i">
            <div class="animate-pulse space-y-3">
              <USkeleton class="h-4 w-28" />
              <USkeleton class="h-3 w-36" />
              <USkeleton class="h-6 w-24" />
            </div>
          </UCard>
        </template>

        <template v-else-if="records.length">
          <UCard v-for="item in records" :key="item.id" class="overflow-hidden rounded-xl">
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted">{{ item.studentName }}</p>
                  <p class="mt-1 text-xs text-muted">{{ item.className }} · {{ formatDate(item.paidAt) }}</p>
                </div>
                <UBadge size="sm" variant="subtle" :icon="CREDIT_ICON" color="success"
                  :label="parsePaymentMethod[item.method] || item.method" />
              </div>

              <div class="flex items-end justify-between border-t border-default pt-3">
                <div>
                  <p class="text-[11px] uppercase tracking-wide text-muted">Amount</p>
                  <p class="font-display text-lg font-semibold text-success">+ {{ format(item.amount || 0) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[11px] uppercase tracking-wide text-muted">{{ item.feeCategoryName }}</p>
                  <p class="font-mono text-xs text-muted">{{ item.receiptNo || '—' }}</p>
                </div>
              </div>
            </div>
          </UCard>
        </template>

        <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
          <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">No payments found.</p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const academicYearStore = useAcademicYearStore()
const termStore = useTermStore()
const classSessionStore = useClassSessionStore()
const store = useFeeReportStore()
const { format } = useMoney()
const { success, error: toastError } = useNotify()

const view = ref<'table' | 'card'>('table')

const filters = reactive({
  from: '',
  to: '',
  academicYearId: '',
  termId: '',
  classSessionId: '',
  studentId: '',
  method: '',
})

const columns = [
  { accessorKey: 'paidAt', header: 'Date' },
  { accessorKey: 'receiptNo', header: 'Receipt' },
  { accessorKey: 'studentName', header: 'Student' },
  { accessorKey: 'feeCategoryName', header: 'Fee Type' },
  { accessorKey: 'method', header: 'Method' },
  { accessorKey: 'recordedBy', header: 'Recorded By' },
  { accessorKey: 'amount', header: 'Amount', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

const localClassSessions = ref<ClassSession[]>([])
const exporting = ref(false)

const academicYears = computed(() => academicYearStore.list)
const terms = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))
const classSessions = computed(() => localClassSessions.value.map(e => {
  let label = `${e.clazz} (${e.sectionName})`
  if (e.streamName !== 'N/A') label += ` - ${e.streamName}`
  return { label, value: e.id }
}))

const records = computed(() => store.paymentHistory)
const meta = computed(() => store.paymentHistoryMeta)
const loading = computed(() => store.loading)

const methodOptions = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank', value: 'BANK' },
  { label: 'Mobile Money', value: 'MOBILE_MONEY' },
]

const filterFields = computed(() => [
  { key: 'from', label: 'From', type: 'date' as const },
  { key: 'to', label: 'To', type: 'date' as const },
  { key: 'academicYearId', label: 'Academic Year', type: 'select' as const, options: academicYears.value, placeholder: 'Every year' },
  { key: 'termId', label: 'Term', type: 'select' as const, options: terms.value, placeholder: 'Every term' },
  { key: 'classSessionId', label: 'Class', type: 'select' as const, options: classSessions.value, placeholder: 'Every class' },
  { key: 'studentId', label: 'Student', type: 'student' as const, placeholder: 'Every student' },
  { key: 'method', label: 'Payment Method', type: 'select' as const, options: methodOptions, placeholder: 'Every method' },
])

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (value) => updateQuery({ page: value }),
})
const size = ref(runtimeConf().limit)

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

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

async function fetchRecords() {
  await store.fetchPaymentHistory(page.value, size.value, buildFilters())
}

async function loadClasses() {
  await classSessionStore.fetchAll(1, 200, filters.academicYearId || undefined)
  localClassSessions.value = classSessionStore.records
}

async function exportReport() {
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

watch(page, fetchRecords)
watch([() => filters.from, () => filters.to, () => filters.termId, () => filters.classSessionId,
  () => filters.studentId, () => filters.method], () => {
  updateQuery({ page: 1 })
  if (page.value === 1) fetchRecords()
})
watch(() => filters.academicYearId, async () => {
  await loadClasses()
  updateQuery({ page: 1 })
  if (page.value === 1) fetchRecords()
})

onMounted(async () => {
  useAppStore().setTitle('Payment History')
  document.title = 'Payment History | Skultem'

  if (!route.query.page || !route.query.size) {
    updateQuery({ page: page.value })
  }

  await academicYearStore.fetchAll(1, 100)
  await termStore.fetchAll(1, 100)
  await loadClasses()
  await fetchRecords()
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
