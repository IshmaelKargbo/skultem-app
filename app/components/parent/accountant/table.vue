<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useParentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

// No "Default" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared", and an item using it throws "A <ComboboxItem /> must
// have a value prop that is not an empty string" the moment the list renders, breaking every item
// in it, not just that one). DEFAULT_SORT below is always a real selection instead.
const sortOptions = [
  { label: 'Name (A-Z)', value: 'user.givenName:asc' },
  { label: 'Name (Z-A)', value: 'user.givenName:desc' },
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
]
const DEFAULT_SORT = 'createdAt:desc'

const columns = [
  { accessorKey: 'name', header: 'Guardian', pin: 'left' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'students', header: 'Children' },
  { accessorKey: 'total', header: 'Total' },
  { accessorKey: 'paid', header: 'Paid' },
  { accessorKey: 'balance', header: 'Outstanding' },
  { accessorKey: 'status', header: 'Status' }
]

// PAGE (URL synced)
const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => {
    updateQuery({
      page: val
    })
  }
})

// SIZE (URL synced)
const size = ref(runtimeConf().limit)

// Plain local refs, not URL-bound computed getters/setters - see grades/approval/admin.vue for
// why a v-model bound straight to a computed setter that triggers router.replace() reads as
// "picking an option/typing does nothing". These still seed from the URL on load and push back
// to it (see the watch below) so a direct link/refresh keeps the filters, but the URL is a
// mirror, not the source of truth.
const searchInput = ref(String(route.query.search ?? ''))
const search = ref(searchInput.value)
const sort = ref(String(route.query.sort ?? DEFAULT_SORT))
const sortBy = computed(() => sort.value.split(':')[0])
const sortDirection = computed(() => sort.value.split(':')[1])

const hasActiveFilters = computed(() => !!search.value || sort.value !== DEFAULT_SORT)

function resetFilters() {
  searchInput.value = ''
  search.value = ''
  sort.value = DEFAULT_SORT
}

// Shadows the global `updateQuery` util (app/utils/common.ts) - that one only ever compares
// page/size and silently drops any other query key when neither changed, which would swallow
// these filter updates whenever a filter is set while already on page 1.
function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = val
  }, 350)
})

// FETCH whenever query changes
watch(
  () => [page.value, size.value],
  async () => {
    await fetchRecord()
  },
  { immediate: true }
)

// Setting a filter also resets the page to 1 and mirrors the current filters into the URL (for a
// shareable link/refresh) - the fetch itself is keyed off the local refs above, not the URL.
watch([search, sort], () => {
  updateQuery({
    search: search.value || undefined,
    sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
    page: 1,
  })

  if (page.value === 1) fetchRecord()
})

async function fetchRecord() {
  loading.value = true
  try {
    await store.fetchAll(page.value, size.value, search.value || undefined, sortBy.value, sortDirection.value)
  } finally {
    loading.value = false
  }
}

// Ensure initial query exists
onMounted(() => {
  updateQuery({
    page: page.value
  })
})
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex px-4 py-3 justify-end">
            <TableViewToggle v-model="view" />
          </div>

          <div class="border-t p-4 border-default flex flex-wrap items-center justify-between gap-3">
            <div class="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <USelectMenu v-model="sort" value-key="value" label-key="label" :items="sortOptions"
                placeholder="Sort by" />
              <UInput v-model="searchInput" :icon="SEARCH_ICON" placeholder="Search by name, email or phone"
                class="col-span-2" />
            </div>
            <div>
              <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
                :disabled="!hasActiveFilters" @click="resetFilters" />
            </div>
          </div>
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block w-full" :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No parents found.</p>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge v-if="row.original.feeDetail" :label="row.original.feeDetail.status"
            :color="parseFeeStatusColor[row.original.feeDetail.status]"
            :icon="parseFeeStatusIcon[row.original.feeDetail.status]" variant="outline" />
        </template>

        <template #students-cell="{ row }">
          <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${row.original.students}`" />
        </template>

        <template #total-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-error">
            {{ format(row.original.feeDetail.total) }}
          </p>
        </template>

        <template #paid-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-success">
            {{ format(row.original.feeDetail.paid) }}
          </p>
        </template>

        <template #balance-cell="{ row }">
          <p v-if="row.original.feeDetail" class="text-info">
            {{ format(row.original.feeDetail.balance) }}
          </p>
        </template>
      </UTable>

      <div class="p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm"
            :ui="{ body: 'p-0' }">
            <div class="animate-pulse">
              <!-- Header -->
              <div class="border-b border-default p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <USkeleton class="size-12 shrink-0 rounded-xl" />

                    <div class="min-w-0 space-y-2">
                      <USkeleton class="h-4 w-36 rounded-md" />
                      <USkeleton class="h-3 w-28 rounded-md" />
                    </div>
                  </div>

                  <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-3 p-4">
                <div v-for="j in 4" :key="j" class="rounded-2xl border border-default bg-muted/40 p-3">
                  <div class="mb-3 flex items-center gap-2">
                    <USkeleton class="size-7 shrink-0 rounded-lg" />
                    <USkeleton class="h-3 w-16 rounded-md" />
                  </div>

                  <USkeleton class="h-4 w-24 rounded-md" />
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between gap-3 border-t border-default p-4">
                <USkeleton class="h-4 w-32 rounded-md" />
                <USkeleton class="h-4 w-20 rounded-md" />
              </div>
            </div>
          </UCard>
        </template>

        <!-- Data -->
        <template v-else-if="data?.length">
          <UCard v-for="parent in data" :key="parent.id"
            class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
            :ui="{ body: 'sm:p-0 p-0' }">
            <!-- Header -->
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <UAvatar size="2xl" icon="i-lucide-user" :alt="parent.name" />

                  <div class="min-w-0">
                    <h3 class="truncate text-base font-bold text-highlighted">
                      {{ parent.name }}
                    </h3>

                    <p class="mt-1 truncate text-xs text-muted">
                      {{ parent.email || 'No Email' }}
                    </p>
                  </div>
                </div>

                <UBadge v-if="parent.feeDetail" :label="parent.feeDetail.status"
                  :color="parseFeeStatusColor[parent.feeDetail.status]"
                  :icon="parseFeeStatusIcon[parent.feeDetail.status]" variant="soft" />
              </div>
            </template>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <!-- Children -->
              <div
                class="min-w-0 rounded-2xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-500/20 dark:bg-primary-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                    <UIcon :name="STUDENT_ICON" class="size-4 text-primary-600 dark:text-primary-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300">
                    Children
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-highlighted">
                  {{ parent.students }}
                </p>
              </div>

              <!-- Total -->
              <div
                class="min-w-0 rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                    <UIcon name="i-lucide-receipt" class="size-4 text-red-600 dark:text-red-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-red-700 dark:text-red-300">
                    Total
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-highlighted">
                  {{ parent.feeDetail ? format(parent.feeDetail.total) : '-' }}
                </p>
              </div>

              <!-- Paid -->
              <div
                class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <UIcon name="i-lucide-circle-check-big" class="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Paid
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-highlighted">
                  {{ parent.feeDetail ? format(parent.feeDetail.paid) : '-' }}
                </p>
              </div>

              <!-- Balance -->
              <div
                class="min-w-0 rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div class="mb-2 flex items-center gap-2">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                    <UIcon name="i-lucide-wallet" class="size-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Balance
                  </p>
                </div>

                <p class="truncate text-sm font-medium text-highlighted">
                  {{ parent.feeDetail ? format(parent.feeDetail.balance) : '-' }}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <template #footer>
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-2 text-sm text-muted">
                  <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
                  <span class="truncate">{{ parent.phone || 'No Phone' }}</span>
                </div>

                <p class="shrink-0 truncate text-sm font-medium text-highlighted">
                  {{ parent.students }} Student{{ parent.students === 1 ? '' : 's' }}
                </p>
              </div>
            </template>
          </UCard>
        </template>

        <!-- Empty -->
        <template v-else>
          <UCard class="col-span-full">
            <div class="flex flex-col items-center justify-center py-14">
              <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400 dark:text-gray-500" />

              <p class="text-sm text-gray-500 dark:text-gray-400">No parents found.</p>
            </div>
          </UCard>
        </template>

      </div>

      <template #footer>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
            size="sm" show-edges class="justify-center lg:justify-end" />
        </div>
      </template>
    </UCard>
  </div>
</template>
