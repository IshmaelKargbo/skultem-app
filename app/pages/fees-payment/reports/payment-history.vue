<template>
  <div class="px-4 sm:px-6 space-y-4">
    <FeeReportSectionNav />

    <Heading title="Payment History" subtitle="Every school-fee payment recorded during a period.">
      <UButton icon="i-lucide-download" variant="outline" color="neutral" class="justify-center"
        :loading="exporting" @click="exportReport">
        Export CSV
      </UButton>
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-col gap-3 p-4">
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <UInput v-model="filters.from" type="date" placeholder="From" class="w-full" />
            <UInput v-model="filters.to" type="date" placeholder="To" class="w-full" />
            <USelectMenu v-model="filters.academicYearId" :items="academicYears" value-key="value" label-key="label"
              clear placeholder="Every year" class="w-full" />
            <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label" clear
              placeholder="Every term" class="w-full" />
          </div>
          <div class="flex items-center gap-2">
            <FeeReportPaymentHistoryFilterDrawer v-model:class-session-id="filters.classSessionId"
              v-model:student-id="filters.studentId" v-model:method="filters.method" :class-options="classSessions"
              :active-count="activeFilterCount" />
            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
              :disabled="!hasActiveFilters" @click="resetFilters" />
          </div>
        </div>
      </template>

      <UTable class="hidden md:block" :columns="columns" :data="records" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No payments found for this filter.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #paidAt-cell="{ row }">
          {{ new Date(row.original.paidAt).toLocaleString() }}
        </template>
        <template #amount-cell="{ row }">
          {{ format(row.original.amount) }}
        </template>
        <template #method-cell="{ row }">
          <UBadge :label="parsePaymentMethod[row.original.method] || row.original.method" variant="outline" />
        </template>
        <template #recordedBy-cell="{ row }">
          {{ row.original.recordedBy || '—' }}
        </template>
      </UTable>

      <div class="p-4 space-y-3 md:hidden">
        <template v-if="loading">
          <USkeleton v-for="i in 6" :key="i" class="h-20 w-full rounded-xl" />
        </template>
        <template v-else-if="records.length">
          <div v-for="p in records" :key="p.id" class="rounded-xl border border-default p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-semibold text-highlighted">{{ p.studentName }}</p>
                <p class="text-xs text-muted">{{ p.className }} &middot; {{ p.feeCategoryName }}</p>
              </div>
              <p class="font-semibold text-success">{{ format(p.amount) }}</p>
            </div>
            <div class="mt-1 flex items-center justify-between text-xs text-muted">
              <span>{{ new Date(p.paidAt).toLocaleString() }}</span>
              <UBadge :label="parsePaymentMethod[p.method] || p.method" variant="outline" size="sm" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />
            <p class="text-sm text-gray-500">No payments found for this filter.</p>
          </div>
        </template>
      </div>

      <template #footer>
        <div class="flex justify-between items-center flex-col md:flex-row space-y-2 md:space-y-0">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
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
  { accessorKey: 'className', header: 'Class' },
  { accessorKey: 'feeCategoryName', header: 'Fee Type' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'method', header: 'Method' },
  { accessorKey: 'recordedBy', header: 'Recorded By' },
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

const activeFilterCount = computed(() => [
  filters.classSessionId, filters.studentId, filters.method,
].filter(Boolean).length)
const hasActiveFilters = computed(() =>
  activeFilterCount.value > 0 || !!filters.from || !!filters.to || !!filters.academicYearId || !!filters.termId)

function resetFilters() {
  filters.from = ''
  filters.to = ''
  filters.academicYearId = ''
  filters.termId = ''
  filters.classSessionId = ''
  filters.studentId = ''
  filters.method = ''
}

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
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
