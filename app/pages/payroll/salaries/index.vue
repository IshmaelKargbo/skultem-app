<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Salary Structures" subtitle="Manage teacher compensation packages.">
      <UButton variant="soft" color="neutral" icon="i-lucide-layout-template" to="/payroll/salary-templates"
        label="Salary Templates" />
      <UButton icon="i-lucide-plus" to="/payroll/salaries/add" label="Add Salary" />
    </Heading>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{ icon: 'i-lucide-users', label: 'Employees', value: summary?.teacherCount ?? 0, isReady: !!summary, color: 'primary' }" />
      <Metric :record="{ icon: 'i-lucide-bar-chart-3', label: 'Average Salary', value: formatCurrency(summary?.averageSalary), isReady: !!summary, color: 'info' }" />
      <Metric :record="{ icon: 'i-lucide-trending-up', label: 'Highest Salary', value: formatCurrency(summary?.highestSalary), isReady: !!summary, color: 'success' }" />
      <Metric :record="{ icon: 'i-lucide-trending-down', label: 'Lowest Salary', value: formatCurrency(summary?.lowestSalary), isReady: !!summary, color: 'warning' }" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search by name or staff ID..." />
          <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions" placeholder="Sort by" />
        </div>

        <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
          :disabled="!hasActiveFilters" @click="resetFilters" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-60 w-full rounded-xl" />
      </div>

      <!-- Salaries -->
      <div v-else-if="salaries.length" class="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard v-for="s in salaries" :key="s.id">
          <div class="space-y-4">

            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <UAvatar size="xl" :src="s.teacher?.user?.photo || undefined" :alt="teacherName(s.teacher)"
                  loading="lazy" />
                <div>
                  <h3 class="font-semibold leading-tight">{{ teacherName(s.teacher) }}</h3>
                  <p class="text-xs text-muted">{{ s.teacher?.staffId }}</p>
                </div>
              </div>

              <UBadge color="success" variant="soft" class="shrink-0">Active</UBadge>
            </div>

            <UBadge v-if="s.templateName" variant="subtle" color="neutral" icon="i-lucide-layout-template" size="sm">
              {{ s.templateName }}
            </UBadge>

            <div class="space-y-2 rounded-xl bg-elevated/50 p-4 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Basic Salary</span>
                <span class="font-medium">{{ formatCurrency(s.basicSalary) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Allowances ({{ s.allowances.length }})</span>
                <span class="font-medium text-success">+ {{ formatCurrency(s.totalAllowances) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Deductions ({{ s.deductions.length }})</span>
                <span class="font-medium text-error">- {{ formatCurrency(s.totalDeductions) }}</span>
              </div>
            </div>

            <div class="rounded-xl bg-primary/10 p-4 text-center">
              <p class="text-xs text-muted">Net Salary</p>
              <p class="text-2xl font-bold text-primary">{{ formatCurrency(s.netSalary) }}</p>
            </div>

            <UButton block variant="soft" trailing-icon="i-lucide-arrow-right" :to="`/payroll/salaries/${s.teacher.id}`">
              View Salary Structure
            </UButton>

          </div>
        </UCard>
      </div>

      <!-- Empty -->
      <UCard v-else class="border-none py-16 shadow-none">
        <div class="flex flex-col items-center gap-3 text-center">
          <UIcon name="i-lucide-wallet" class="text-4xl text-muted" />
          <h3 class="font-semibold">{{ hasActiveFilters ? 'No matches found' : 'No salary structures yet' }}</h3>
          <p class="text-sm text-muted">
            {{ hasActiveFilters ? 'Try a different search or sort.' : 'Set a compensation package for a teacher to get started.' }}
          </p>
          <UButton v-if="!hasActiveFilters" size="sm" icon="i-lucide-plus" to="/payroll/salaries/add">Add Salary</UButton>
        </div>
      </UCard>

      <div v-if="!loading && salaries.length"
        class="flex flex-col gap-3 border-t border-default p-4 sm:flex-row sm:items-center sm:justify-between">
        <Showing :meta="meta" />
        <UPagination v-if="meta.total > meta.size" v-model:page="page" size="sm" :page-size="meta.size"
          :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { salaries, salariesMeta: meta, loadingSalaries: loading, summary } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

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
  set: (val) => updateQuery({ sort: val === DEFAULT_SORT ? undefined : val, page: 1 })
})

const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

const hasActiveFilters = computed(() => !!search.value || sort.value !== DEFAULT_SORT)

function resetFilters() {
  search.value = ''
  updateQuery({ search: undefined, sort: undefined, page: 1 })
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

// A local override - the global updateQuery only compares page/size and silently drops any other
// query key (search/sort) when neither changed, e.g. setting a filter while already on page 1.
function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateQuery({ search: value || undefined, page: 1 })
  }, 300)
})

function teacherName(teacher?: Teacher) {
  if (!teacher) return ''
  return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

function formatCurrency(value?: number | null) {
  return `Le ${Number(value || 0).toLocaleString()}`
}

function load() {
  store.fetchSalaries(page.value, 12, String(route.query.search ?? ''), sortBy.value, sortDirection.value)
}

watch(() => [route.query.page, route.query.search, route.query.sort], load)

onMounted(() => {
  useAppStore().setTitle('Salary Structures')
  useAppStore().setBack('/payroll')
  document.title = 'Salary Structures | Payroll | Skultem'

  load()
  if (!summary.value) store.fetchSummary()
})

onBeforeUnmount(() => clearTimeout(searchTimeout))

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
