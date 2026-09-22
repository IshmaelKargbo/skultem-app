<template>
  <div class="px-4 sm:px-6 space-y-4">
    <FeeReportSectionNav />

    <Heading title="Student Balances" subtitle="Every student's current fee position, without opening them one by one.">
      <div class="flex gap-2">
        <UButton icon="i-lucide-download" variant="outline" color="neutral" class="justify-center"
          :loading="exporting" @click="exportReport">
          Export CSV
        </UButton>
      </div>
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-col gap-3 p-4">
          <div class="grid gap-2 sm:grid-cols-3">
            <USelectMenu v-model="filters.academicYearId" :items="academicYears" value-key="value" label-key="label"
              placeholder="Active year" class="w-full" />
            <USelectMenu v-model="filters.termId" :items="terms" value-key="value" label-key="label" clear
              placeholder="Whole year" class="w-full" />
            <USelectMenu v-model="sortBy" :items="sortOptions" value-key="value" label-key="label"
              placeholder="Sort by" class="w-full" />
          </div>
          <div class="flex items-center gap-2">
            <FeeReportStudentBalanceFilterDrawer v-model:class-session-id="filters.classSessionId" v-model:status="filters.status"
              v-model:fee-category-id="filters.feeCategoryId" v-model:balance-min="filters.balanceMin"
              v-model:balance-max="filters.balanceMax" :class-options="classSessions"
              :fee-category-options="feeCategories" :active-count="activeFilterCount" />
            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
              :disabled="!hasActiveFilters" @click="resetFilters" />
          </div>
        </div>
      </template>

      <UTable class="hidden md:block" :columns="columns" :data="records" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No students found for this filter.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #studentName-cell="{ row }">
          <NuxtLink :to="`/transactions/student-ledger?search=${encodeURIComponent(row.original.studentName)}`"
            class="text-primary-600 hover:underline">
            {{ row.original.studentName }}
          </NuxtLink>
        </template>
        <template #expected-cell="{ row }">
          {{ format(row.original.expected) }}
        </template>
        <template #paid-cell="{ row }">
          <span class="text-success">{{ format(row.original.paid) }}</span>
        </template>
        <template #balance-cell="{ row }">
          <span :class="row.original.balance > 0 ? 'text-error font-semibold' : 'text-gray-500'">
            {{ format(row.original.balance) }}
          </span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :label="parseFeeCollectionStatus[row.original.status]"
            :color="parseFeeCollectionStatusColor[row.original.status]" variant="subtle" />
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="p-4 space-y-3 md:hidden">
        <template v-if="loading">
          <USkeleton v-for="i in 6" :key="i" class="h-20 w-full rounded-xl" />
        </template>
        <template v-else-if="records.length">
          <NuxtLink v-for="s in records" :key="s.studentId"
            :to="`/transactions/student-ledger?search=${encodeURIComponent(s.studentName)}`"
            class="block rounded-xl border border-default p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-semibold text-highlighted">{{ s.studentName }}</p>
                <p class="text-xs text-muted">{{ s.admissionNumber }} &middot; {{ s.className }}</p>
              </div>
              <UBadge :label="parseFeeCollectionStatus[s.status]" :color="parseFeeCollectionStatusColor[s.status]"
                variant="subtle" size="sm" />
            </div>
            <div class="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p class="text-muted">Expected</p>
                <p class="font-medium">{{ format(s.expected) }}</p>
              </div>
              <div>
                <p class="text-muted">Paid</p>
                <p class="font-medium text-success">{{ format(s.paid) }}</p>
              </div>
              <div>
                <p class="text-muted">Balance</p>
                <p class="font-medium" :class="s.balance > 0 ? 'text-error' : ''">{{ format(s.balance) }}</p>
              </div>
            </div>
          </NuxtLink>
        </template>
        <template v-else>
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />
            <p class="text-sm text-gray-500">No students found for this filter.</p>
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
const feeStore = useFeeStore()
const store = useFeeReportStore()
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

const columns = [
  { accessorKey: 'studentName', header: 'Student' },
  { accessorKey: 'className', header: 'Class' },
  { accessorKey: 'expected', header: 'Expected' },
  { accessorKey: 'paid', header: 'Paid' },
  { accessorKey: 'balance', header: 'Balance' },
  { accessorKey: 'status', header: 'Status' },
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
const feeCategories = computed(() => feeStore.records.map(c => ({ label: c.name, value: c.id })))

const records = computed(() => store.studentBalances)
const meta = computed(() => store.studentBalancesMeta)
const loading = computed(() => store.loading)

const activeFilterCount = computed(() => [
  filters.classSessionId, filters.status, filters.feeCategoryId, filters.balanceMin, filters.balanceMax,
].filter(Boolean).length)
const hasActiveFilters = computed(() => activeFilterCount.value > 0 || sortBy.value !== DEFAULT_SORT)

function resetFilters() {
  filters.classSessionId = ''
  filters.status = ''
  filters.feeCategoryId = ''
  filters.balanceMin = ''
  filters.balanceMax = ''
  sortBy.value = DEFAULT_SORT
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (value) => updateQuery({ page: value }),
})
const size = ref(runtimeConf().limit)

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

async function fetchRecords() {
  const [sortField, sortDirection] = sortBy.value.split(':')
  await store.fetchStudentBalances(page.value, size.value, {
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
}

async function loadClasses() {
  await classSessionStore.fetchAll(1, 200, filters.academicYearId || undefined)
  localClassSessions.value = classSessionStore.records
}

async function exportReport() {
  exporting.value = true
  try {
    const [sortField, sortDirection] = sortBy.value.split(':')
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

watch(page, fetchRecords)
watch([() => filters.termId, () => filters.classSessionId, () => filters.status, () => filters.feeCategoryId,
  () => filters.balanceMin, () => filters.balanceMax, sortBy], () => {
  updateQuery({ page: 1 })
  if (page.value === 1) fetchRecords()
})
watch(() => filters.academicYearId, async () => {
  await loadClasses()
  updateQuery({ page: 1 })
  if (page.value === 1) fetchRecords()
})

onMounted(async () => {
  useAppStore().setTitle('Student Balances')
  document.title = 'Student Balances | Skultem'

  if (!route.query.page || !route.query.size) {
    updateQuery({ page: page.value })
  }

  await academicYearStore.fetchAll(1, 100)
  filters.academicYearId = academicYearStore.viewingYearId || academicYearStore.activeYear?.id || ''

  await termStore.fetchAll(1, 100)
  await feeStore.fetchAll(1, 100)
  await loadClasses()
  await fetchRecords()
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
