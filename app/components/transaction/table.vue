<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { transactions: data, meta, loading, report } = storeToRefs(store)
const { format } = useMoney()
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }: any) => formatDate(row.original.createdAt)
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }: any) => clean(row.original.type)
  },
  {
    accessorKey: 'referenceType',
    header: 'Reference',
    cell: ({ row }: any) => clean(row.original.referenceType)
  },
  {
    accessorKey: 'direction',
    header: 'Direction'
  },
  {
    accessorKey: 'amount',
    header: 'Amount'
  },
  {
    accessorKey: 'balance',
    header: 'Balance'
  },
]

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

watch(() => page.value, () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecord()
}, { immediate: true })

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) {
    return
  }

  router.replace({ query: merged })
}

async function fetchRecord() {
  if (report.value == null) return
  loading.value = true
  await store.runReport(report.value, page.value, size.value)
  loading.value = false
}

const equalSelectOperators = (options: Option[] = []): ReportOperator[] => [
  { name: "Equals (=)", operator: "EQUALS", type: "select", input: "select", options },
  { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "select", input: "select", options }
]

const instantOperators: ReportOperator[] = [
  { name: "Equals (=)", operator: "EQUALS", type: "instant", input: "date" },
  { name: "Not Equals (!=)", operator: "NOT_EQUALS", type: "instant", input: "date" },
  { name: "After (>)", operator: "GREATER_THAN", type: "instant", input: "date" },
  { name: "Before (<)", operator: "LESS_THAN", type: "instant", input: "date" },
  { name: "Between (↔)", operator: "BETWEEN", type: "instant", input: "date-range" },
]

const selected = ref<ReportSelectPayload>({
  entity: "transactions",
  filters: [
    { field: "createdAt", label: "Date", operators: instantOperators },
    { field: "direction", label: "Direction", operators: equalSelectOperators(directionOptions) },
    { field: "type", label: "Type", operators: equalSelectOperators(typeOptions) },
    { field: "referenceType", label: "Reference", operators: equalSelectOperators(referenceTypeOptions) }
  ]
})

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }
})
</script>

<template>
  <div class="space-y-5">
    <TransactionFilters :selected="selected" />
    <UCard class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No transaction found.</p>
          </div>
        </template>
        <template #direction-cell="{ row }">
          <UBadge :icon="row.original.direction == 'CREDIT' ? CREDIT_ICON : DEBIT_ICON"
            :color="row.original.direction == 'CREDIT' ? 'success' : 'error'" :label="clean(row.original.direction)"
            variant="outline" />
        </template>
        <template #amount-cell="{ row }">
          <p class="font-medium" :class="{
            'text-success': row.original.direction == 'CREDIT',
            'text-error': row.original.direction == 'DEBIT',
          }">{{ format(row.original.amount) }}</p>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #balance-cell="{ row }">
          <p class="text-info font-medium">{{ format(row.original.balance) }}</p>
        </template>
      </UTable>
      <template #footer>
        <div v-if="meta" class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
    <!-- Mobile -->
    <div class="space-y-4 md:hidden">

      <!-- Loading -->
      <template v-if="loading">
        <UCard v-for="i in 5" :key="i" :ui="{ body: 'p-4' }">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-24" />
              </div>

              <USkeleton class="h-7 w-20 rounded-full" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <USkeleton class="h-20 rounded-2xl" />
              <USkeleton class="h-20 rounded-2xl" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Records -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="`${item.createdAt}-${item.referenceType}-${item.amount}`"
          class="overflow-hidden" :ui="{ body: 'p-0' }">
          <div class="p-4 space-y-4">

            <!-- Header -->
            <div class="flex items-start justify-between gap-3">

              <div class="flex gap-3">

                <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="item.direction === 'CREDIT'
                  ? 'bg-success-50 dark:bg-success-500/10'
                  : 'bg-error-50 dark:bg-error-500/10'">
                  <UIcon :name="item.direction === 'CREDIT'
                    ? CREDIT_ICON
                    : DEBIT_ICON" class="text-lg" :class="item.direction === 'CREDIT'
                      ? 'text-success'
                      : 'text-error'" />
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="truncate text-sm font-semibold">
                      {{ clean(item.type) }}
                    </h3>

                    <p class="text-xs text-muted">
                      ( {{ clean(item.referenceType) }} )
                    </p>

                  </div>
                  <p class="mt-1 text-xs text-muted">
                    {{ formatDate(item.createdAt) }}
                  </p>
                </div>

              </div>

              <UBadge size="sm" variant="soft" :icon="item.direction === 'CREDIT'
                ? CREDIT_ICON
                : DEBIT_ICON" :color="item.direction === 'CREDIT'
                  ? 'success'
                  : 'error'" :label="clean(item.direction)" />
            </div>

            <!-- Amount Cards -->
            <div class="grid grid-cols-2 gap-3">

              <div class="rounded-2xl p-3" :class="item.direction === 'CREDIT'
                ? 'bg-success-50 dark:bg-success-950/20'
                : 'bg-error-50 dark:bg-error-950/20'">
                <p class="text-[11px] text-muted">
                  Amount
                </p>

                <p class="mt-1 text-sm font-bold" :class="item.direction === 'CREDIT'
                  ? 'text-success'
                  : 'text-error'">
                  {{ format(item.amount) }}
                </p>
              </div>

              <div class="rounded-2xl bg-info-50 p-3 dark:bg-info-950/20">
                <p class="text-[11px] text-muted">
                  Balance
                </p>

                <p class="mt-1 text-sm font-bold text-info">
                  {{ format(item.balance) }}
                </p>
              </div>

            </div>

          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="flex flex-col items-center py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <UIcon name="i-lucide-receipt" class="size-10 text-muted" />
          </div>

          <h3 class="mt-4 text-sm font-semibold">
            No transactions found
          </h3>

          <p class="mt-1 text-sm text-muted">
            Transaction records will appear here.
          </p>
        </div>
      </template>

      <!-- Pagination -->
      <div v-if="!loading && data?.length" class="flex flex-col items-center gap-3 pt-2">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
