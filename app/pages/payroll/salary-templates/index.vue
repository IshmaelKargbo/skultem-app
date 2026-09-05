<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Salary Templates" subtitle="Reusable compensation packages you can apply to any teacher.">
      <UButton variant="soft" color="neutral" to="/payroll/salaries" label="Back to Salaries" />
      <UButton icon="i-lucide-plus" to="/payroll/salary-templates/add" label="Add Template" />
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <div class="p-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search templates by name..." />
          <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions" placeholder="Sort by" />
        </div>

        <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
          :disabled="!hasActiveFilters" @click="resetFilters" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid gap-4 border-t border-default p-4 md:grid-cols-2 xl:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-52 w-full rounded-xl" />
      </div>

      <!-- Templates -->
      <div v-else-if="templates.length" class="grid gap-4 border-t border-default p-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard v-for="t in templates" :key="t.id">
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UIcon name="i-lucide-layout-template" class="size-5" />
                </div>
                <div class="min-w-0">
                  <h3 class="truncate font-semibold leading-tight">{{ t.name }}</h3>
                  <p class="text-xs text-muted">Basic {{ formatCurrency(t.basicSalary) }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-2 rounded-xl bg-elevated/50 p-4 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Allowances ({{ t.allowances.length }})</span>
                <span class="font-medium text-success">+ {{ formatCurrency(t.totalAllowances) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Deductions ({{ t.deductions.length }})</span>
                <span class="font-medium text-error">- {{ formatCurrency(t.totalDeductions) }}</span>
              </div>
            </div>

            <div class="rounded-xl bg-primary/10 p-4 text-center">
              <p class="text-xs text-muted">Net Salary (at this basic)</p>
              <p class="text-2xl font-bold text-primary">{{ formatCurrency(t.netSalary) }}</p>
            </div>

            <div class="flex gap-2">
              <UButton class="flex-1" variant="soft" color="neutral" :icon="EDIT_ICON" label="Edit"
                :to="`/payroll/salary-templates/edit/${t.id}`" />
              <UButton :icon="DELETE_ICON" color="error" variant="soft" @click="remove(t)" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty -->
      <UCard v-else class="border-none py-16 shadow-none">
        <div class="flex flex-col items-center gap-3 text-center">
          <UIcon name="i-lucide-layout-template" class="text-4xl text-muted" />
          <h3 class="font-semibold">{{ hasActiveFilters ? 'No matches found' : 'No salary templates yet' }}</h3>
          <p class="text-sm text-muted">
            {{ hasActiveFilters ? 'Try a different search or sort.' : 'Build a reusable compensation package to apply to teachers on the same grade.' }}
          </p>
          <UButton v-if="!hasActiveFilters" size="sm" icon="i-lucide-plus" to="/payroll/salary-templates/add">Add Template</UButton>
        </div>
      </UCard>

      <div v-if="!loading && templates.length"
        class="flex flex-col gap-3 border-t border-default p-4 sm:flex-row sm:items-center sm:justify-between">
        <Showing :meta="meta" />
        <UPagination v-if="meta.total > meta.size" v-model:page="page" size="sm" :page-size="meta.size"
          :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </UCard>

    <ConfirmDeleteModal v-if="selected" v-model:open="deleteModalOpen" title="Delete Salary Template"
      :item-name="selected.name"
      description="Teachers already set up from this template keep their own pay - this only removes the reusable template itself."
      :on-confirm="confirmDelete" />

  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { templates, templatesMeta: meta, loadingTemplates: loading } = storeToRefs(store)
const { success: toastSuccess, error: toastError } = useNotify()

const route = useRoute()
const router = useRouter()

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

function formatCurrency(value?: number | null) {
  return `Le ${Number(value || 0).toLocaleString()}`
}

function load() {
  store.fetchSalaryTemplates(page.value, 12, String(route.query.search ?? ''), sortBy.value, sortDirection.value)
}

watch(() => [route.query.page, route.query.search, route.query.sort], load)

const selected = ref<SalaryTemplate>()
const deleteModalOpen = ref(false)

function remove(template: SalaryTemplate) {
  selected.value = template
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!selected.value) return
  try {
    await store.deleteSalaryTemplate(selected.value.id)
    toastSuccess('Salary template deleted successfully')
  } catch (err: any) {
    toastError(err?.message || 'Failed to delete salary template')
  }
}

onMounted(() => {
  useAppStore().setTitle('Salary Templates')
  useAppStore().setBack('/payroll/salaries')
  document.title = 'Salary Templates | Payroll | Skultem'

  load()
})

onBeforeUnmount(() => clearTimeout(searchTimeout))

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
