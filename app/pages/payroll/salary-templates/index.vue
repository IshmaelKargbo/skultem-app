<template>
  <div class="space-y-3 px-4 md:px-6">

    <Heading title="Salary Templates" subtitle="Reusable compensation packages you can apply to any teacher.">
      <UButton variant="soft" color="neutral" to="/payroll/salaries" label="Back to Salaries" />
      <UButton data-guide="pay-add-template" icon="i-lucide-plus" to="/payroll/salary-templates/add" label="Add Template" />
    </Heading>

    <PayrollSectionNav />
    <GuideBar topic="payroll-templates" />

    <UCard data-guide="pay-template-list" :ui="{ body: 'p-0 sm:p-0' }">
      <div class="p-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search templates by name..." />
          <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions" placeholder="Sort by" />
        </div>

        <div class="flex items-center gap-2">
          <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
            :disabled="!hasActiveFilters" @click="resetFilters" />
        </div>
      </div>

      <!-- Table view (desktop) -->
      <UTable v-if="(loading || templates.length)" class="hidden border-t border-default md:block"
        :columns="columns" :data="templates" :loading="loading" :ui="{ tr: 'cursor-pointer' }"
        @select="(_e: Event, row: any) => openTemplate(row.original)">
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UBadge variant="soft" icon="i-lucide-layout-template" square class="shrink-0 rounded-lg" />
            <span class="font-medium text-highlighted">{{ row.original.name }}</span>
          </div>
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
      <div v-if="(loading || templates.length)" class="border-t border-default md:hidden">
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
            <div class="space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-20" />
            </div>
            <USkeleton class="h-4 w-16" />
          </div>
        </template>
        <NuxtLink v-for="t in templates" v-else :key="t.id" :to="`/payroll/salary-templates/edit/${t.id}`"
          class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0 hover:bg-muted/40">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-highlighted">{{ t.name }}</p>
            <p class="truncate text-xs text-muted">
              Basic {{ formatCurrency(t.basicSalary) }} · {{ t.allowances.length }} allowances · {{ t.deductions.length }} deductions
            </p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-sm font-bold text-primary">{{ formatCurrency(t.netSalary) }}</p>
            <p class="text-[11px] text-muted">net</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Loading -->

      <!-- Templates -->

      <!-- Empty -->
      <UCard v-if="!loading && !templates.length && !failed" class="border-none py-16 shadow-none">
        <div class="flex flex-col items-center gap-3 text-center">
          <UIcon name="i-lucide-layout-template" class="text-4xl text-muted" />
          <h3 class="font-semibold">{{ hasActiveFilters ? 'No matches found' : 'No salary templates yet' }}</h3>
          <p class="text-sm text-muted">
            {{ hasActiveFilters ? 'Try a different search or sort.' : 'Build a reusable compensation package to apply to teachers on the same grade.' }}
          </p>
          <UButton v-if="!hasActiveFilters" size="sm" icon="i-lucide-plus" to="/payroll/salary-templates/add">Add Template</UButton>
        </div>
      </UCard>

      <div ref="sentinel" class="border-t border-default">
        <InfiniteListEnd :loading="loading" :loading-more="loadingMore" :failed="failed" :shown="templates.length"
          :total="meta?.total" noun="salary templates" :error="listError" @retry="loadMore" />
      </div>
    </UCard>


  </div>
</template>

<script setup lang="ts">

const route = useRoute()
const router = useRouter()


const right = { class: { th: 'text-right', td: 'text-right' } }
const columns = [
  { accessorKey: 'name', header: 'Template' },
  { accessorKey: 'basicSalary', header: 'Basic', meta: right },
  { accessorKey: 'totalAllowances', header: 'Allowances', meta: right },
  { accessorKey: 'totalDeductions', header: 'Deductions', meta: right },
  { accessorKey: 'netSalary', header: 'Net Salary', meta: right },
]

const sortOptions = [
  { label: 'Name: A to Z', value: 'name:asc' },
  { label: 'Name: Z to A', value: 'name:desc' },
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
  { label: 'Basic Salary: High to Low', value: 'basicSalary:desc' },
  { label: 'Basic Salary: Low to High', value: 'basicSalary:asc' }
]
const DEFAULT_SORT = 'name:asc'

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

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateQuery({ search: value || undefined })
  }, 300)
})

const { format } = useMoney()

function formatCurrency(value?: number | null) {
  return format(value || 0)
}

// One scrolling list: the next templates load as the end comes into view. A row (or card) opens the template,
// where it is edited or deleted.
const { items: templates, meta, loading, loadingMore, failed, error: listError, sentinel, reload, loadMore } =
  useInfiniteList<SalaryTemplate>((page, size) => PayrollApi().listSalaryTemplates(page, size,
    String(route.query.search ?? ''), sortBy.value, sortDirection.value) as any)

watch(() => [route.query.search, route.query.sort], () => reload())

function openTemplate(t: SalaryTemplate) {
  navigateTo(`/payroll/salary-templates/edit/${t.id}`)
}

onMounted(() => {
  useAppStore().setTitle('Salary Templates')
  document.title = 'Salary Templates | Payroll | Skultem'

  // Old links may still carry ?page=; the list starts at the top now.
  if (route.query.page) {
    const { page: _page, ...rest } = route.query
    router.replace({ query: rest })
  }
  reload()
})

onBeforeUnmount(() => clearTimeout(searchTimeout))

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
