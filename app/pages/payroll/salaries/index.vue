<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="Salary Structures" subtitle="Manage teacher compensation packages.">
      <UButton variant="soft" color="neutral" icon="i-lucide-layout-template" to="/payroll/salary-templates"
        label="Salary Templates" data-guide="pay-templates-link" />
      <UButton data-guide="pay-add-salary" icon="i-lucide-plus" to="/payroll/salaries/add" label="Add Salary" />
    </Heading>

    <PayrollSectionNav />
    <GuideBar topic="payroll-salaries" />

    <!-- Stats -->
    <div data-guide="pay-salary-stats" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{ icon: 'i-lucide-users', label: 'Employees', value: summary?.teacherCount ?? 0, isReady: !!summary, color: 'primary' }" />
      <Metric :record="{ icon: 'i-lucide-bar-chart-3', label: 'Average Salary', value: formatCurrency(summary?.averageSalary), isReady: !!summary, color: 'info' }" />
      <Metric :record="{ icon: 'i-lucide-trending-up', label: 'Highest Salary', value: formatCurrency(summary?.highestSalary), isReady: !!summary, color: 'success' }" />
      <Metric :record="{ icon: 'i-lucide-trending-down', label: 'Lowest Salary', value: formatCurrency(summary?.lowestSalary), isReady: !!summary, color: 'warning' }" />
    </div>

    <UCard data-guide="pay-salary-list" :ui="{ body: 'p-0 sm:p-0' }">
      <div data-guide="pay-salary-filters" class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search by name or staff ID..." />
          <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions" placeholder="Sort by" />
        </div>

        <div class="flex items-center gap-2">
          <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
            :disabled="!hasActiveFilters" @click="resetFilters" />
        </div>
      </div>

      <!-- Table view (desktop) -->
      <UTable v-if="(loading || salaries.length)" class="hidden border-t border-default md:block"
        :columns="columns" :data="salaries" :loading="loading" :ui="{ tr: 'cursor-pointer' }"
        @select="(_e: Event, row: any) => openSalary(row.original)">
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #employee-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar size="sm" :src="row.original.teacher?.user?.photo || undefined"
              :alt="teacherName(row.original.teacher)" loading="lazy" />
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">{{ teacherName(row.original.teacher) }}</p>
              <p class="truncate text-xs text-muted">{{ row.original.teacher?.staffId }}</p>
            </div>
          </div>
        </template>
        <template #templateName-cell="{ row }">
          <UBadge v-if="row.original.templateName" variant="subtle" color="neutral" size="sm"
            icon="i-lucide-layout-template">{{ row.original.templateName }}</UBadge>
          <span v-else class="text-xs text-muted">Custom</span>
        </template>
        <template #basicSalary-cell="{ row }">{{ formatCurrency(row.original.basicSalary) }}</template>
        <template #totalAllowances-cell="{ row }">
          <span class="text-success">+ {{ formatCurrency(row.original.totalAllowances) }}</span>
          <span class="ml-1 text-xs text-muted">({{ row.original.allowances.length }})</span>
        </template>
        <template #totalDeductions-cell="{ row }">
          <span class="text-error">− {{ formatCurrency(row.original.totalDeductions) }}</span>
          <span class="ml-1 text-xs text-muted">({{ row.original.deductions.length }})</span>
        </template>
        <template #netSalary-cell="{ row }">
          <span class="font-semibold text-primary">{{ formatCurrency(row.original.netSalary) }}</span>
        </template>
      </UTable>

      <!-- Table view (mobile list) -->
      <div v-if="(loading || salaries.length)" class="border-t border-default md:hidden">
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="flex items-center gap-3 border-b border-default px-4 py-3 last:border-0">
            <USkeleton class="size-8 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-20" />
            </div>
            <USkeleton class="h-4 w-16" />
          </div>
        </template>
        <NuxtLink v-for="s in salaries" v-else :key="s.id" :to="`/payroll/salaries/${s.teacher.id}`"
          class="flex items-center gap-3 border-b border-default px-4 py-3 last:border-0 hover:bg-muted/40">
          <UAvatar size="sm" :src="s.teacher?.user?.photo || undefined" :alt="teacherName(s.teacher)" loading="lazy" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-highlighted">{{ teacherName(s.teacher) }}</p>
            <p class="truncate text-xs text-muted">{{ s.teacher?.staffId }}<template v-if="s.templateName"> · {{ s.templateName }}</template></p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-sm font-bold text-primary">{{ formatCurrency(s.netSalary) }}</p>
            <p class="text-[11px] text-muted">net / month</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Loading -->

      <!-- Salaries -->

      <!-- Empty -->
      <UCard v-if="!loading && !salaries.length && !failed" class="border-none py-16 shadow-none">
        <div class="flex flex-col items-center gap-3 text-center">
          <UIcon name="i-lucide-wallet" class="text-4xl text-muted" />
          <h3 class="font-semibold">{{ hasActiveFilters ? 'No matches found' : 'No salary structures yet' }}</h3>
          <p class="text-sm text-muted">
            {{ hasActiveFilters ? 'Try a different search or sort.' : 'Set a compensation package for a teacher to get started.' }}
          </p>
          <UButton v-if="!hasActiveFilters" size="sm" icon="i-lucide-plus" to="/payroll/salaries/add">Add Salary</UButton>
        </div>
      </UCard>

      <div ref="sentinel" class="border-t border-default">
        <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="salaries.length"
          :total="meta?.total" noun="salary structures" :error="listError" @retry="loadMore" />
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { summary } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

// Table is easier to scan with many staff; cards are kept for anyone who prefers them.

const right = { class: { th: 'text-right', td: 'text-right' } }
const columns = [
  { id: 'employee', header: 'Employee' },
  { accessorKey: 'templateName', header: 'Template' },
  { accessorKey: 'basicSalary', header: 'Basic', meta: right },
  { accessorKey: 'totalAllowances', header: 'Allowances', meta: right },
  { accessorKey: 'totalDeductions', header: 'Deductions', meta: right },
  { accessorKey: 'netSalary', header: 'Net Salary', meta: right },
]

const sortOptions = [
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
  { label: 'Basic Salary: High to Low', value: 'basicSalary:desc' },
  { label: 'Basic Salary: Low to High', value: 'basicSalary:asc' },
  { label: 'Name: A to Z', value: 'teacher.user.givenName:asc' },
  { label: 'Name: Z to A', value: 'teacher.user.givenName:desc' }
]
const DEFAULT_SORT = 'createdAt:desc'

const search = ref(String(route.query.search ?? ''))

const sort = computed<string>({
  get: () => String(route.query.sort ?? DEFAULT_SORT),
  set: (val) => updateQuery({ sort: val === DEFAULT_SORT ? undefined : val })
})

const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

const hasActiveFilters = computed(() => !!search.value || sort.value !== DEFAULT_SORT)

function resetFilters() {
  search.value = ''
  updateQuery({ search: undefined, sort: undefined })
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateQuery({ search: value || undefined })
  }, 300)
})

function teacherName(teacher?: Teacher) {
  if (!teacher) return ''
  return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

const { format } = useMoney()

function formatCurrency(value?: number | null) {
  return format(value || 0)
}

// One scrolling list: the next salaries load as the end comes into view. A row (or card) opens the teacher's salary.
const { items: salaries, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
  useInfiniteList<TeacherSalary>((page, size) => PayrollApi().listSalaries(page, size, String(route.query.search ?? ''),
    sortBy.value, sortDirection.value) as any)

watch(() => [route.query.search, route.query.sort], () => reload())

function openSalary(s: TeacherSalary) {
  navigateTo(`/payroll/salaries/${s.teacher.id}`)
}

onMounted(() => {
  useAppStore().setTitle('Salary Structures')
  document.title = 'Salary Structures | Payroll | Skultem'

  // Old links may still carry ?page=; the list starts at the top now.
  if (route.query.page) {
    const { page: _page, ...rest } = route.query
    router.replace({ query: rest })
  }
  reload()
  if (!summary.value) store.fetchSummary()
})

onBeforeUnmount(() => clearTimeout(searchTimeout))

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
