<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Salary Structures" subtitle="Manage teacher compensation packages.">
      <UButton icon="i-lucide-plus" to="/payroll/salaries/add" label="Add Salary" />
    </Heading>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{ icon: 'i-lucide-users', label: 'Employees', value: summary?.teacherCount ?? 0, isReady: !!summary, color: 'primary' }" />
      <Metric :record="{ icon: 'i-lucide-bar-chart-3', label: 'Average Salary', value: formatCurrency(summary?.averageSalary), isReady: !!summary, color: 'info' }" />
      <Metric :record="{ icon: 'i-lucide-trending-up', label: 'Highest Salary', value: formatCurrency(summary?.highestSalary), isReady: !!summary, color: 'success' }" />
      <Metric :record="{ icon: 'i-lucide-trending-down', label: 'Lowest Salary', value: formatCurrency(summary?.lowestSalary), isReady: !!summary, color: 'warning' }" />
    </div>

    <!-- Search -->
    <UCard>
      <UInput v-model="search" icon="i-lucide-search" placeholder="Search by name or staff ID..." class="w-full" />
    </UCard>

    <!-- Loading -->
    <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="h-60 w-full rounded-xl" />
    </div>

    <!-- Salaries -->
    <div v-else-if="salaries.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="s in salaries" :key="s.id">
        <div class="space-y-4">

          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3">
              <UAvatar size="xl" :src="s.teacher?.user?.photo || undefined" :alt="teacherName(s.teacher)" />
              <div>
                <h3 class="font-semibold leading-tight">{{ teacherName(s.teacher) }}</h3>
                <p class="text-xs text-muted">{{ s.teacher?.staffId }}</p>
              </div>
            </div>

            <UBadge color="success" variant="soft" class="shrink-0">Active</UBadge>
          </div>

          <div class="space-y-2 rounded-xl bg-elevated/50 p-4 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">Basic Salary</span>
              <span class="font-medium">{{ formatCurrency(s.basicSalary) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Allowances</span>
              <span class="font-medium text-success">+ {{ formatCurrency(s.allowances) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Deductions</span>
              <span class="font-medium text-error">- {{ formatCurrency(s.deductions) }}</span>
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
    <UCard v-else class="py-16">
      <div class="flex flex-col items-center gap-3 text-center">
        <UIcon name="i-lucide-wallet" class="text-4xl text-muted" />
        <h3 class="font-semibold">{{ search ? 'No matches found' : 'No salary structures yet' }}</h3>
        <p class="text-sm text-muted">
          {{ search ? 'Try a different search.' : 'Set a compensation package for a teacher to get started.' }}
        </p>
        <UButton v-if="!search" size="sm" icon="i-lucide-plus" to="/payroll/salaries/add">Add Salary</UButton>
      </div>
    </UCard>

    <div v-if="!loading && salaries.length"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Showing :meta="meta" />
      <UPagination v-if="meta.total > meta.size" v-model:page="page" size="sm" :page-size="meta.size"
        :items-per-page="meta.size" :total="meta.total" show-edges />
    </div>

  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { salaries, salariesMeta: meta, loadingSalaries: loading, summary } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

const search = ref(String(route.query.search ?? ''))

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    router.replace({ query: { ...route.query, search: value || undefined, page: 1 } })
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
  store.fetchSalaries(page.value, 12, String(route.query.search ?? ''))
}

watch(() => [route.query.page, route.query.search], load)

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
