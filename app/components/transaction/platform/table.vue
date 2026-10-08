<template>
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
        <template #header>
          <div>
            <div class="flex items-center justify-between gap-2 px-4 py-3">
              <div>
                <p class="font-semibold">Platform Fee Entries</p>
                <p class="text-xs text-muted">The platform fee charged to each student and the payments made towards it</p>
              </div>
              
            </div>

            <div class="flex items-center gap-2 border-t border-default p-4">
              <UInput v-model="value" :icon="SEARCH_ICON" placeholder="Search by name or admission no" class="flex-1" />
              <FilterDrawer v-model="filters" :fields="filterFields" title="Filter platform fee entries"
                description="Narrow the list by class, type, term or order" />
            </div>
          </div>
        </template>

        <UTable class="hidden md:block" :columns="columns" :data="records" :loading="loading">
            <template #empty-state>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="i-lucide-shield" class="text-4xl text-gray-400" />
                    <p class="text-gray-500">No platform fee entries yet.</p>
                </div>
            </template>

            <template #loading>
                <TableLoading :size="columns.length" />
            </template>

            <template #date-cell="{ row }">
                <p class="text-xs text-muted">{{ formatDate(row.original.date) }}</p>
            </template>
            <template #type-cell="{ row }">
                <UBadge variant="subtle" :color="typeColor[row.original.type]" :label="typeLabel[row.original.type] ?? row.original.type" />
            </template>
            <template #debit-cell="{ row }">
                <p class="text-error font-semibold">{{ row.original.debit ? format(row.original.debit) : '-' }}</p>
            </template>
            <template #credit-cell="{ row }">
                <p class="text-success font-semibold">{{ row.original.credit ? format(row.original.credit) : '-' }}</p>
            </template>
        </UTable>

        <!-- Mobile -->
        <div class="md:hidden">
            <template v-if="loading">
                <div v-for="i in 4" :key="i" class="border-b border-gray-200 px-4 py-3 last:border-0">
                    <div class="flex items-center justify-between gap-3">
                        <div class="space-y-2">
                            <USkeleton class="h-4 w-32" />
                            <USkeleton class="h-3 w-24" />
                        </div>
                        <USkeleton class="h-4 w-20" />
                    </div>
                </div>
            </template>

            <template v-else-if="records.length">
                <div v-for="(item, index) in records" :key="`${item.date}-${item.student}-${index}`"
                    class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 last:border-0">
                    <div class="min-w-0 space-y-1">
                        <h3 class="truncate text-sm font-semibold text-highlighted">{{ item.student || 'No Student' }}</h3>
                        <div class="flex items-center gap-2 text-xs text-muted">
                            <p class="truncate">{{ item.clazz || 'No Class' }}</p>
                            <p>·</p>
                            <p>{{ formatDate(item.date) }}</p>
                        </div>
                    </div>

                    <div class="shrink-0 space-y-1 text-right">
                        <p class="text-sm font-bold" :class="item.credit ? 'text-success' : 'text-error'">
                            {{ item.credit ? '+' : '-' }}{{ format(item.credit || item.debit || 0) }}
                        </p>
                        <UBadge size="xs" variant="soft" :color="typeColor[item.type]"
                            :label="typeLabel[item.type] ?? item.type" />
                    </div>
                </div>
            </template>

            <div v-else class="flex flex-col items-center gap-2 py-10">
                <UIcon name="i-lucide-shield" class="text-4xl text-gray-400" />
                <p class="text-gray-500">No platform fee entries yet.</p>
            </div>
        </div>

        <template #footer>
            <div class="flex items-center flex-col md:flex-row space-y-2 md:space-y-0 justify-between">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = usePlatformFeeStore()
const { records, meta, loading } = storeToRefs(store)
const { format } = useMoney()

const columns = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'student', header: 'Student' },
    { accessorKey: 'clazz', header: 'Class' },
    { accessorKey: 'debit', header: 'Charged', meta: { class: { th: 'text-right', td: 'text-right' } } },
    { accessorKey: 'credit', header: 'Paid', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

// On this page a debit is the fee being charged and a credit is a payment towards it.
const typeLabel: Record<string, string> = {
    FEE_ASSINMENT: 'Charged',
    PAYMENT: 'Payment',
    DISCOUNT: 'Discount',
    REFUND: 'Refund',
    ADJUSTMENT: 'Adjustment',
}
const typeColor: Record<string, 'neutral' | 'success' | 'info' | 'warning'> = {
    FEE_ASSINMENT: 'neutral',
    PAYMENT: 'success',
    DISCOUNT: 'info',
    REFUND: 'warning',
    ADJUSTMENT: 'warning',
}

const size = Number(runtimeConf().limit) || 10

// --- Filters: the same row as the Student Ledger ------------------------------------------------
const clazzStore = useClassStore()
const academicYearStore = useAcademicYearStore()
const { termList } = storeToRefs(academicYearStore)

// A platform fee only ever has a charge and payments towards it.
const typeOptions = [
    { label: 'Charged', value: 'FEE_ASSINMENT' },
    { label: 'Payment', value: 'PAYMENT' },
]
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
  { key: 'type', label: 'Type', type: 'select' as const, options: typeOptions, placeholder: 'All Types' },
  { key: 'termId', label: 'Term', type: 'select' as const, options: termList.value, placeholder: 'All Terms' },
  { key: 'sort', label: 'Sort by', type: 'select' as const, options: sortOptions, default: DEFAULT_SORT, required: true },
])

const classOptions = computed(() => clazzStore.records.map((e) => ({ label: e.name, value: e.id })))

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val }),
})

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

function fetchRecord() {
    return store.fetchEntries(page.value, size, {
        search: search.value || undefined,
        classId: filters.value.classId || undefined,
        type: filters.value.type || undefined,
        termId: filters.value.termId || undefined,
        sort: filters.value.sort === DEFAULT_SORT ? undefined : filters.value.sort,
    })
}

watch(page, () => fetchRecord())

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

onMounted(async () => {
    if (!route.query.page) {
        updateQuery({ page: page.value })
    }

    if (!termList.value.length) academicYearStore.getTerms()
    clazzStore.fetchAll(0, 0)
    await fetchRecord()
})
</script>
