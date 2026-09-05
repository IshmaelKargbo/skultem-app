<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Payroll Runs" subtitle="Every payroll cycle, past and present.">
      <UButton icon="i-lucide-play" to="/payroll/runs/new" label="Start Payroll Run" />
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <div class="p-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search by period..." />
          <USelectMenu v-model="status" value-key="value" label-key="label" :items="statusOptions"
            placeholder="All statuses" clear />
          <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions" placeholder="Sort by" />
        </div>

        <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
          :disabled="!hasActiveFilters" @click="resetFilters" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-3 border-t border-default p-4">
        <USkeleton v-for="i in 4" :key="i" class="h-20 w-full rounded-xl" />
      </div>

      <!-- Runs -->
      <div v-else-if="runs.length" class="divide-y divide-default border-t border-default">
        <NuxtLink v-for="run in runs" :key="run.id" :to="`/payroll/runs/${run.id}`"
          class="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40">
          <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UIcon name="i-lucide-wallet" class="size-5" />
            </div>
            <div>
              <h3 class="font-medium">{{ run.period }}</h3>
              <p class="text-xs text-muted">Pay date {{ formatDate(run.payDate) }}</p>
            </div>
          </div>

          <UBadge :color="payrollRunStatusColor(run.status)" variant="soft">
            {{ clean(run.status) }}
          </UBadge>
        </NuxtLink>
      </div>

      <!-- Empty -->
      <UCard v-else class="border-none py-16 shadow-none">
        <div class="flex flex-col items-center gap-3 text-center">
          <UIcon name="i-lucide-history" class="text-4xl text-muted" />
          <h3 class="font-semibold">{{ hasActiveFilters ? 'No matches found' : 'No payroll runs yet' }}</h3>
          <p class="text-sm text-muted">
            {{ hasActiveFilters ? 'Try a different search, status, or sort.' : 'Start your first payroll run once salaries are set up.' }}
          </p>
          <UButton v-if="!hasActiveFilters" size="sm" icon="i-lucide-play" to="/payroll/runs/new">Start Payroll Run</UButton>
        </div>
      </UCard>

      <div v-if="!loading && runs.length && meta.total > meta.size"
        class="flex flex-col gap-3 border-t border-default p-4 sm:flex-row sm:items-center sm:justify-between">
        <Showing :meta="meta" />
        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { runs, runsMeta: meta, loadingRuns: loading } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Generated', value: 'GENERATED' },
  { label: 'Published', value: 'PUBLISHED' }
]

const sortOptions = [
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
  { label: 'Pay Date: Soonest', value: 'payDate:asc' },
  { label: 'Pay Date: Latest', value: 'payDate:desc' },
  { label: 'Period: A to Z', value: 'period:asc' },
  { label: 'Period: Z to A', value: 'period:desc' }
]
const DEFAULT_SORT = 'createdAt:desc'

const search = ref(String(route.query.search ?? ''))

const status = computed<string>({
  get: () => String(route.query.status ?? ''),
  set: (val) => updateQuery({ status: val || undefined, page: 1 })
})

const sort = computed<string>({
  get: () => String(route.query.sort ?? DEFAULT_SORT),
  set: (val) => updateQuery({ sort: val === DEFAULT_SORT ? undefined : val, page: 1 })
})

const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

const hasActiveFilters = computed(() => !!search.value || !!status.value || sort.value !== DEFAULT_SORT)

function resetFilters() {
  search.value = ''
  updateQuery({ search: undefined, status: undefined, sort: undefined, page: 1 })
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

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

function load() {
  store.fetchRuns(page.value, 10, String(route.query.search ?? ''), status.value, sortBy.value, sortDirection.value)
}

watch(() => [route.query.page, route.query.search, route.query.status, route.query.sort], load)

onMounted(() => {
  useAppStore().setTitle('Payroll Runs')
  useAppStore().setBack('/payroll')
  document.title = 'Payroll Runs | Payroll | Skultem'

  load()
})

onBeforeUnmount(() => clearTimeout(searchTimeout))

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
