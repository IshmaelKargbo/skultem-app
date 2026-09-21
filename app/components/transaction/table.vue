<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useTransactionStore()
const { records: data, meta, loading } = storeToRefs(store)
const { format } = useMoney()
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

// How a transaction's direction reads: money in (credit) or out (debit).
const DIRECTION_STYLES: Record<string, { icon: string, color: 'success' | 'error', sign: string, text: string }> = {
  CREDIT: { icon: CREDIT_ICON, color: 'success', sign: '+', text: 'text-success' },
  DEBIT: { icon: DEBIT_ICON, color: 'error', sign: '−', text: 'text-error' },
}

function directionStyle(direction: string) {
  return DIRECTION_STYLES[direction] ?? DIRECTION_STYLES.DEBIT!
}

const columns = [
  { accessorKey: 'createdAt', header: 'Date' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'referenceType', header: 'Reference' },
  { accessorKey: 'direction', header: 'Direction' },
  { accessorKey: 'amount', header: 'Amount', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'balance', header: 'Balance', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

// --- Filters: the same row as the Student Ledger, Students and Teachers lists ---------------------
const sortOptions = [
  { label: 'Newest first', value: 'desc' },
  { label: 'Oldest first', value: 'asc' },
]
const DEFAULT_SORT = 'desc'

const type = ref(String(route.query.type ?? ''))
const direction = ref(String(route.query.direction ?? ''))
const referenceType = ref(String(route.query.referenceType ?? ''))
const from = ref(String(route.query.from ?? ''))
const to = ref(String(route.query.to ?? ''))
const sort = ref(String(route.query.sort ?? DEFAULT_SORT))
const filterState = ref(false) // the filter row's open/closed state on mobile

const hasActiveFilters = computed(() =>
  !!type.value || !!direction.value || !!referenceType.value || !!from.value || !!to.value
  || sort.value !== DEFAULT_SORT)

function resetFilters() {
  type.value = ''
  direction.value = ''
  referenceType.value = ''
  from.value = ''
  to.value = ''
  sort.value = DEFAULT_SORT
}

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
  await store.fetchAll(page.value, size.value, {
    type: type.value || undefined,
    direction: direction.value || undefined,
    referenceType: referenceType.value || undefined,
    from: from.value || undefined,
    to: to.value || undefined,
    sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
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

// Any filter change goes back to page 1 and is kept in the URL, so a filtered view can be shared or reloaded.
watch([type, direction, referenceType, from, to, sort], () => {
  updateQuery({
    type: type.value || undefined,
    direction: direction.value || undefined,
    referenceType: referenceType.value || undefined,
    from: from.value || undefined,
    to: to.value || undefined,
    sort: sort.value === DEFAULT_SORT ? undefined : sort.value,
    page: 1,
  })

  if (page.value === 1) fetchRecord()
})

onMounted(() => {
  if (!route.query.page) {
    updateQuery({ page: page.value })
  }
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
    <template #header>
      <div>
        <div class="flex items-center justify-between px-4 py-3">
          <div>
            <p>Transactions</p>
            <p class="text-xs text-muted">Complete financial transaction history</p>
          </div>
          <div class="flex items-center gap-2">
            <TableViewToggle v-model="view" />
            <UButton @click="filterState = !filterState" :icon="!filterState ? FILTER_ICON : CLOSE_ICON"
              variant="outline" :color="!filterState ? 'info' : 'error'" class="md:hidden" />
          </div>
        </div>

        <!-- Always shown from md up; on mobile it opens with the filter button -->
        <div :class="filterState ? 'flex' : 'hidden'"
          class="md:flex flex-wrap items-center justify-between gap-3 border-t border-default p-4">
          <div class="flex-1 grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <USelectMenu class="w-full" v-model="type" value-key="value" label-key="label" :items="typeOptions"
              placeholder="All Types" clear />
            <USelectMenu class="w-full" v-model="direction" value-key="value" label-key="label"
              :items="directionOptions" placeholder="All Directions" clear />
            <USelectMenu class="w-full" v-model="referenceType" value-key="value" label-key="label"
              :items="referenceTypeOptions" placeholder="All References" clear />
            <USelectMenu class="w-full" v-model="sort" value-key="value" label-key="label" :items="sortOptions"
              placeholder="Sort by" />
            <UInput v-model="from" type="date" :max="to || undefined" aria-label="From date">
              <template #leading><span class="text-xs text-muted">From</span></template>
            </UInput>
            <UInput v-model="to" type="date" :min="from || undefined" aria-label="To date">
              <template #leading><span class="text-xs text-muted">To</span></template>
            </UInput>
          </div>
          <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
            :disabled="!hasActiveFilters" @click="resetFilters" />
        </div>
      </div>
    </template>

    <!-- Desktop table -->
    <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No transactions found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #createdAt-cell="{ row }">
        <p class="text-xs text-muted">{{ formatDate(row.original.createdAt) }}</p>
      </template>
      <template #type-cell="{ row }">
        <p class="font-medium">{{ clean(row.original.type) }}</p>
      </template>
      <template #referenceType-cell="{ row }">
        <p class="text-muted">{{ clean(row.original.referenceType) }}</p>
      </template>
      <template #direction-cell="{ row }">
        <UBadge :icon="directionStyle(row.original.direction).icon"
          :color="directionStyle(row.original.direction).color" :label="clean(row.original.direction)"
          variant="subtle" />
      </template>
      <template #amount-cell="{ row }">
        <p class="font-semibold" :class="directionStyle(row.original.direction).text">
          {{ directionStyle(row.original.direction).sign }} {{ format(row.original.amount) }}
        </p>
      </template>
      <template #balance-cell="{ row }">
        <p class="font-semibold text-info">{{ format(row.original.balance) }}</p>
      </template>
    </UTable>

    <!-- Mobile list: one clean row per transaction -->
    <div v-if="view === 'table'" class="md:hidden">
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="border-b border-default px-4 py-3 last:border-0">
          <div class="flex items-center justify-between gap-3">
            <div class="space-y-2">
              <USkeleton class="h-4 w-28" />
              <USkeleton class="h-3 w-36" />
            </div>
            <div class="space-y-2">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="ml-auto h-3 w-16" />
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="data?.length">
        <div v-for="item in data" :key="item.id"
          class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
          <div class="min-w-0 space-y-1">
            <p class="truncate text-sm font-semibold text-highlighted">{{ clean(item.type) }}</p>
            <div class="flex items-center gap-2 text-xs text-muted">
              <p class="truncate">{{ clean(item.referenceType) }}</p>
              <p>·</p>
              <p class="shrink-0">{{ formatDate(item.createdAt) }}</p>
            </div>
          </div>

          <div class="shrink-0 space-y-1 text-right">
            <p class="text-sm font-bold" :class="directionStyle(item.direction).text">
              {{ directionStyle(item.direction).sign }} {{ format(item.amount) }}
            </p>
            <p class="text-xs text-muted">Balance {{ format(item.balance) }}</p>
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center gap-2 py-12">
        <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
        <p class="text-sm text-gray-500">No transactions found.</p>
      </div>
    </div>

    <!-- Card view -->
    <div v-if="view === 'card'" class="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 lg:grid-cols-3">
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i">
          <div class="animate-pulse space-y-3">
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-3 w-36" />
            <USkeleton class="h-6 w-24" />
          </div>
        </UCard>
      </template>

      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id" class="overflow-hidden rounded-xl">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">{{ clean(item.type) }}</p>
                <p class="mt-1 text-xs text-muted">{{ clean(item.referenceType) }} · {{ formatDate(item.createdAt) }}</p>
              </div>
              <UBadge size="sm" variant="subtle" :icon="directionStyle(item.direction).icon"
                :color="directionStyle(item.direction).color" :label="clean(item.direction)" />
            </div>

            <div class="flex items-end justify-between border-t border-default pt-3">
              <div>
                <p class="text-[11px] uppercase tracking-wide text-muted">Amount</p>
                <p class="font-display text-lg font-semibold" :class="directionStyle(item.direction).text">
                  {{ directionStyle(item.direction).sign }} {{ format(item.amount) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-[11px] uppercase tracking-wide text-muted">Balance</p>
                <p class="text-sm font-semibold text-info">{{ format(item.balance) }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
        <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
        <p class="text-sm text-gray-500">No transactions found.</p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
</template>
