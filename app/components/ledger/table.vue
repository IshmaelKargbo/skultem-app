<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()

const ledgerStore = useLedgerStore()
const academicYearStore = useAcademicYearStore()
const clazzStore = useClassStore()
const { format } = useMoney()
const { entries: data, entriesMeta: meta, entriesLoading: loading, total } = storeToRefs(ledgerStore)
const { termList } = storeToRefs(academicYearStore)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  {
    accessorKey: 'date',
    header: 'Date'
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'clazz',
    header: 'Class'
  },
  {
    accessorKey: 'debit',
    header: 'Debit',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right'
      }
    },
  },
  {
    accessorKey: 'credit',
    header: 'Credit',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right'
      }
    },
  }
]

const parseType: Record<string, string> = {
  "FEE_ASSINMENT": "Fee Assignment",
  "DISCOUNT": "Discount",
  "PAYMENT": "Payment",
}

const parseTypeColor: Record<string, string> = {
  "FEE_ASSINMENT": "neutral",
  "DISCOUNT": "info",
  "PAYMENT": "success",
}

// --- Filters: the same search + select row as the Students and Teachers lists ---------------------
const sortOptions = [
  { label: 'Newest first', value: 'desc' },
  { label: 'Oldest first', value: 'asc' },
]
const DEFAULT_SORT = 'desc'

const value = ref(String(route.query.search ?? '')) // what's typed
const search = ref(value.value) // the typed text once the user pauses - this is what drives the fetch
// What the filter drawer holds (search sits outside it, beside the drawer button).
const filters = ref<Record<string, string>>({
  classId: String(route.query.classId ?? ''),
  type: String(route.query.type ?? ''),
  termId: String(route.query.termId ?? ''),
  sort: String(route.query.sort ?? DEFAULT_SORT),
})

const filterFields = computed(() => [
  { key: 'classId', label: 'Class', type: 'select' as const, options: classOptions.value, placeholder: 'All Classes' },
  { key: 'type', label: 'Type', type: 'select' as const, options: ledgerTypeOptions, placeholder: 'All Types' },
  { key: 'termId', label: 'Term', type: 'select' as const, options: termList.value, placeholder: 'All Terms' },
  { key: 'sort', label: 'Sort by', type: 'select' as const, options: sortOptions, default: DEFAULT_SORT, required: true },
])

const classOptions = computed(() => clazzStore.records.map((e) => ({ label: e.name, value: e.id })))

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  router.replace({ query: { ...route.query, ...newQuery } })
}

async function fetchRecord() {
  await ledgerStore.fetchEntries(page.value, size.value, {
    search: search.value || undefined,
    classId: filters.value.classId || undefined,
    type: filters.value.type || undefined,
    termId: filters.value.termId || undefined,
    sort: filters.value.sort === DEFAULT_SORT ? undefined : filters.value.sort,
  })
}

watch(() => page.value, () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })

  fetchRecord()
}, { immediate: true })

let searchTimer: ReturnType<typeof setTimeout>

watch(value, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = val
  }, 500)
})

// Any filter change goes back to page 1 and is kept in the URL, so a filtered view can be shared or reloaded.
watch([search, filters], () => {
  updateQuery({
    search: search.value || undefined,
    classId: filters.value.classId || undefined,
    type: filters.value.type || undefined,
    termId: filters.value.termId || undefined,
    sort: filters.value.sort === DEFAULT_SORT ? undefined : filters.value.sort,
    page: 1,
  })

  if (page.value === 1) fetchRecord()
})

onMounted(() => {
  if (!route.query.page) {
    updateQuery({ page: page.value })
  }

  if (!termList.value.length) academicYearStore.getTerms()
  clazzStore.fetchAll(0, 0)
})
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex items-center justify-between gap-2 px-4 py-3">
            <div>
              <p class="font-semibold">Student Ledger</p>
              <p class="text-xs text-muted">Every school fee charged, paid and discounted</p>
            </div>
            <TableViewToggle v-model="view" />
          </div>

          <div class="flex items-center gap-2 border-t border-default p-4">
            <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or admission no" class="flex-1" />
            <FilterDrawer v-model="filters" :fields="filterFields" title="Filter ledger"
              description="Narrow the list by class, type, term or order" />
          </div>
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading"
        :ui="{ tfoot: 'bg-app-50/10' }">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No ledger record found.</p>
          </div>
        </template>
        <template #debit-cell="{ row }">
          <p class="text-error font-semibold">{{ row.original.debit ? format(row.original.debit || 0) : '-' }}</p>
        </template>
        <template #debit-footer>
          <p class="text-error font-semibold">{{ format(total.totalDebit || 0) }}</p>
        </template>
        <template #credit-cell="{ row }">
          <p class="text-success font-semibold">{{ row.original.credit ? format(row.original.credit || 0) : '-' }}</p>
        </template>
        <template #credit-footer>
          <p class="text-success font-semibold">{{ format(total.totalCredit || 0) }}</p>
        </template>
        <template #type-cell="{ row }">
          <UBadge variant="subtle" :color="parseTypeColor[row.original.type]" :label="parseType[row.original.type]" />
        </template>
        <template #date-footer>
          <p>Total</p>
        </template>
      </UTable>
      <div v-else-if="view === 'card'" class="hidden md:block">
        <div v-if="!loading && !data?.length" class="flex flex-col items-center justify-center py-16">
          <div class="flex size-20 items-center justify-center rounded-3xl bg-muted">
            <UIcon name="ph:books-light" class="text-4xl text-muted" />
          </div>

          <p class="mt-4 text-sm text-muted">
            No ledger records found
          </p>
        </div>

        <template v-else>
          <div class="grid grid-cols-1 gap-4 space-y-0! p-4 md:grid-cols-2 lg:grid-cols-3">
            <!-- Ledger Cards -->
            <div v-for="item in data" :key="`${item.date}-${item.student}-${item.type}`"
              class="border rounded-2xl border-default" :ui="{ body: 'sm:p-0 p-0' }">
              <!-- Header -->
              <div class="flex items-start justify-between gap-4 border-default p-4">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="min-w-0 space-y-0.5">
                    <div class="flex items-center gap-2">
                      <h3 class="truncate text-sm font-semibold text-highlighted">
                        {{ item.student || 'No Student' }}
                      </h3>
                    </div>

                    <div class="flex space-x-2 items-center text-muted">
                      <p class="truncate text-xs">
                        {{ item.clazz || 'No Class' }}
                      </p>
                      <p>·</p>
                      <p class="text-xs">
                        {{ item.date }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Type -->
                <div class="flex flex-col space-y-0.5 items-end">
                  <p class="font-bold text-info">
                    {{ format(item.balance || 0) }}
                  </p>
                  <div class="flex space-x-2">
                    <p :class="item.credit
                      ? 'text-success'
                      : 'text-error'
                      ">
                      {{ item.credit ? '+' : '-' }}{{
                        format(item.credit || item.debit || 0)
                      }}
                    </p>
                    <UBadge size="xs" variant="soft" :label="parseType[item.type]" :color="parseTypeColor[item.type]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Mobile List (default Table view fallback, mirrors /transactions mobile design) -->
      <div class="md:hidden">
        <!-- Loading -->
        <template v-if="loading">
          <div v-for="i in size" :key="i" class="border-b border-gray-200 px-4 py-3 last:border-0">
            <div class="flex items-center justify-between gap-3">
              <div class="space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-24" />
              </div>

              <div class="space-y-2">
                <div class="flex justify-end">
                  <USkeleton class="h-4 w-20" />
                </div>
                <div class="flex justify-end gap-2">
                  <USkeleton class="h-3 w-14" />
                  <USkeleton class="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Records -->
        <template v-else-if="data?.length">
          <div v-for="item in data" :key="`${item.date}-${item.student}-${item.type}`"
            class="overflow-hidden border-b border-gray-200 px-4 py-3 last:border-0">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0 space-y-1">
                <h3 class="truncate text-sm font-semibold text-highlighted">
                  {{ item.student || 'No Student' }}
                </h3>

                <div class="flex items-start flex-col gap-2 text-xs text-muted">
                  <p class="truncate">{{ item.clazz || 'No Class' }}</p>
                  <p class="text-xs-base">{{ item.date }}</p>
                </div>
              </div>

              <div class="shrink-0 space-y-1 text-right">
                <p class="text-sm font-bold text-info">
                  {{ format(item.balance || 0) }}
                </p>

                <div class="flex flex-col items-end gap-2">
                  <p class="text-sm font-bold" :class="item.credit ? 'text-success' : 'text-error'">
                    {{ item.credit ? '+' : '-' }}{{ format(item.credit || item.debit || 0) }}
                  </p>

                  <UBadge size="xs" variant="soft" :label="parseType[item.type]" :color="parseTypeColor[item.type]" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <template v-else>
          <div class="flex flex-col items-center py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <UIcon name="ph:books-light" class="size-10 text-muted" />
            </div>

            <h3 class="mt-4 text-sm font-semibold">
              No ledger records found
            </h3>

            <p class="mt-1 text-sm text-muted">
              Ledger records will appear here.
            </p>
          </div>
        </template>
      </div>

      <!-- Card View (explicit toggle, unchanged detail layout) -->


      <template #footer>
        <div class="flex flex-col md:flex-row space-y-2 md:space-x-0 justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" />
        </div>
      </template>
    </UCard>
  </div>
</template>
