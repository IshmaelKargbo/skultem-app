<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { transactions: data, meta, loading, report } = storeToRefs(store)
const { format } = useMoney()
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

type AmountStyle = {
  color: 'success' | 'error' | 'info'
  sign: string
  text: string     // unshaded — desktop table cells, top-level icon
  bg: string       // bg-X-50 dark:bg-X-500/10 — icon circle backdrop / card outer bg
  border: string   // border-X-200 dark:border-X-500/20 — card outer border
  iconBg: string   // bg-X-100 dark:bg-X-500/20 — card inner icon circle
  iconText: string // text-X-600 dark:text-X-400 — card inner icon color
  label: string    // text-X-700 dark:text-X-300 — card label + value
}

const DIRECTION_STYLES: Record<string, AmountStyle & { icon: string, arrowIcon: string }> = {
  CREDIT: {
    icon: CREDIT_ICON,
    arrowIcon: 'i-lucide-arrow-down-left',
    color: 'success',
    sign: '+',
    text: 'text-success',
    bg: 'bg-success-50 dark:bg-success-500/10',
    border: 'border-success-200 dark:border-success-500/20',
    iconBg: 'bg-success-100 dark:bg-success-500/20',
    iconText: 'text-success-600 dark:text-success-400',
    label: 'text-success-700 dark:text-success-300'
  },
  DEBIT: {
    icon: DEBIT_ICON,
    arrowIcon: 'i-lucide-arrow-up-right',
    color: 'error',
    sign: '−',
    text: 'text-error',
    bg: 'bg-error-50 dark:bg-error-500/10',
    border: 'border-error-200 dark:border-error-500/20',
    iconBg: 'bg-error-100 dark:bg-error-500/20',
    iconText: 'text-error-600 dark:text-error-400',
    label: 'text-error-700 dark:text-error-300'
  }
}

function directionStyle(direction: string) {
  return DIRECTION_STYLES[direction] ?? DIRECTION_STYLES.DEBIT
}

function balanceStyle(balance: number): AmountStyle {
  return balance < 0
    ? {
        color: 'error',
        sign: '',
        text: 'text-error',
        bg: 'bg-error-50 dark:bg-error-500/10',
        border: 'border-error-200 dark:border-error-500/20',
        iconBg: 'bg-error-100 dark:bg-error-500/20',
        iconText: 'text-error-600 dark:text-error-400',
        label: 'text-error-700 dark:text-error-300'
      }
    : {
        color: 'info',
        sign: '',
        text: 'text-info',
        bg: 'bg-info-50 dark:bg-info-500/10',
        border: 'border-info-200 dark:border-info-500/20',
        iconBg: 'bg-info-100 dark:bg-info-500/20',
        iconText: 'text-info-600 dark:text-info-400',
        label: 'text-info-700 dark:text-info-300'
      }
}

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
      page: page.value
    }
  })

  fetchRecord()
}, { immediate: true })

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page
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
  if (!route.query.page) {
    router.replace({
      query: {
        page: page.value
      }
    })
  }
})
</script>

<template>
  <div class="space-y-5">
    <TransactionFilters :selected="selected" />
    <TableViewToggle v-model="view" />
    <UCard v-if="view === 'table'" class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No transactions found.</p>
          </div>
        </template>
        <template #direction-cell="{ row }">
          <UBadge :icon="directionStyle(row.original.direction).icon" :color="directionStyle(row.original.direction).color"
            :label="clean(row.original.direction)" variant="outline" />
        </template>
        <template #amount-cell="{ row }">
          <p class="font-medium" :class="directionStyle(row.original.direction).text">
            {{ directionStyle(row.original.direction).sign }} {{ format(row.original.amount) }}
          </p>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #balance-cell="{ row }">
          <p class="font-medium" :class="balanceStyle(row.original.balance).text">{{ format(row.original.balance) }}</p>
        </template>
      </UTable>
      <template #footer>
        <div v-if="!loading && data?.length" class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
    <!-- Mobile -->
    <div class="space-y-4" :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">

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
        <UCard v-for="item in data" :key="item.id" class="overflow-hidden" :ui="{ body: 'p-0' }">
          <div class="space-y-4">

            <!-- Header -->
            <div class="flex items-start justify-between border-b border-default  p-3 md:p-0 md:pb-3">

              <div class="flex gap-3">

                <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="directionStyle(item.direction).bg">
                  <UIcon :name="directionStyle(item.direction).icon" class="text-lg" :class="directionStyle(item.direction).text" />
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

              <UBadge size="sm" variant="soft" :icon="directionStyle(item.direction).icon"
                :color="directionStyle(item.direction).color" :label="clean(item.direction)" />
            </div>

            <!-- Amount Cards -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <!-- Amount -->
              <div class="min-w-0 rounded-2xl border p-3" :class="[directionStyle(item.direction).border, directionStyle(item.direction).bg]">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg" :class="directionStyle(item.direction).iconBg">
                    <UIcon :name="directionStyle(item.direction).arrowIcon" class="size-4" :class="directionStyle(item.direction).iconText" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide" :class="directionStyle(item.direction).label">
                    Amount
                  </p>
                </div>

                <p class="truncate text-sm font-bold" :class="directionStyle(item.direction).label">
                  {{ directionStyle(item.direction).sign }} {{ format(item.amount) }}
                </p>
              </div>

              <!-- Balance -->
              <div class="min-w-0 rounded-2xl border p-3" :class="[balanceStyle(item.balance).border, balanceStyle(item.balance).bg]">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-lg" :class="balanceStyle(item.balance).iconBg">
                    <UIcon name="i-lucide-wallet" class="size-4" :class="balanceStyle(item.balance).iconText" />
                  </div>

                  <p class="text-[10px] font-medium uppercase tracking-wide" :class="balanceStyle(item.balance).label">
                    Balance
                  </p>
                </div>

                <p class="truncate text-sm font-bold" :class="balanceStyle(item.balance).label">
                  {{ format(item.balance) }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="flex flex-col items-center py-16 col-span-full">
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
      <div v-if="!loading && data?.length"
        class="flex flex-col md:flex-row md:justify-between md:w-full items-center gap-3 pt-2 col-span-full">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
