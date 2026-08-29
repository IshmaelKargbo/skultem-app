<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()

const store = useReportStore()
const ledgerStore = useLedgerStore()
const academicYearStore = useAcademicYearStore()
const { format } = useMoney()
const { ledger: data, meta, loading, report } = storeToRefs(store)
const { total } = storeToRefs(ledgerStore)
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
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right'
      }
    },
    footer: () => {
      return format(total.value.finalBalance)
    }
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

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (merged.page === route.query.page) {
    return
  }

  router.replace({ query: merged })
}

async function fetchRecord() {
  if (report.value == null) return
  // LedgerTableMobile (rendered alongside this one, self-hiding by breakpoint) watches this same
  // route query and reacts to page changes identically - without this guard, every page change
  // fires two concurrent runReport calls for the two of them, and whichever resolves last
  // silently wins even if it was the stale one.
  if (loading.value) return

  loading.value = true
  await store.runReport(report.value, page.value, size.value)
  loading.value = false
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

onMounted(() => {
  if (!route.query.page) {
    router.replace({
      query: {
        ...route.query,
        page: page.value
      }
    })
  }

  if (!termList.value.length) academicYearStore.getTerms()
})

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

const selected = computed<ReportSelectPayload>(() => ({
  entity: "ledger",
  filters: [
    { field: "paidAt", label: "Date", operators: instantOperators },
    { field: "transactionType", label: "Type", operators: equalSelectOperators(ledgerTypeOptions) },
    { field: "direction", label: "Direction", operators: equalSelectOperators(directionOptions) },
    { field: "termId", label: "Term", operators: equalSelectOperators(termList.value) }
  ]
}))
</script>

<template>
  <div class="space-y-4">
    <TransactionFilters :selected="selected" />
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-end">
          <TableViewToggle v-model="view" />
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
        <template #balance-cell="{ row }">
          <p class="text-info font-semibold">{{ format(row.original.balance || 0) }}</p>
        </template>
        <template #balance-footer>
          <p class="text-info font-semibold">{{ format(total.finalBalance || 0) }}</p>
        </template>
        <template #date-footer>
          <p>Total</p>
        </template>
      </UTable>

      <!-- Empty -->
      <div v-if="!loading && !data?.length" class="flex flex-col items-center justify-center py-16 col-span-full">
        <div class="flex size-20 items-center justify-center rounded-3xl bg-muted">
          <UIcon name="ph:books-light" class="text-4xl text-muted" />
        </div>

        <p class="mt-4 text-sm text-muted">
          No ledger records found
        </p>
      </div>

      <!-- Transactions -->
      <template v-else>
        <div class="p-4"
          :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
          <!-- Ledger Cards -->
          <UCard v-for="item in data" :key="`${item.date}-${item.student}-${item.type}`" :ui="{ body: 'sm:p-0 p-0' }">
            <!-- Header -->
            <template #header>
              <div class="flex items-start justify-between gap-4">
                <div class="flex min-w-0 items-center gap-3">
                  <!-- Transaction Icon -->
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="item.credit
                    ? 'bg-success/10'
                    : 'bg-error/10'
                    ">
                    <UIcon :name="item.credit
                      ? 'i-lucide-arrow-down-left'
                      : 'i-lucide-arrow-up-right'
                      " class="size-5" :class="item.credit
                        ? 'text-success'
                        : 'text-error'
                        " />
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="truncate text-sm font-semibold text-highlighted">
                        {{ item.student || 'No Student' }}
                      </h3>
                    </div>

                    <p class="mt-0.5 truncate text-xs text-muted">
                      {{ item.clazz || 'No Class' }}
                    </p>
                  </div>
                </div>

                <!-- Type -->
                <UBadge size="sm" variant="soft" :label="parseType[item.type]" :color="parseTypeColor[item.type]" />
              </div>
            </template>

            <div class="p-4">
              <!-- Transaction -->
              <div class="flex items-center justify-between rounded-xl border border-default bg-muted/40 p-4">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-arrow-left-right" class="size-4 text-muted" />

                  <span class="text-xs text-muted">
                    Transaction
                  </span>
                </div>

                <span class="text-xl font-bold tracking-tight" :class="item.credit
                  ? 'text-success'
                  : 'text-error'
                  ">
                  {{ item.credit ? '+' : '-' }}{{
                    format(item.credit || item.debit || 0)
                  }}
                </span>
              </div>

              <!-- Transaction Details -->
              <div class="mt-3 grid grid-cols-2 gap-3">
                <!-- Credit -->
                <div class="rounded-xl border border-success/10 bg-success/5 px-3 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex size-7 items-center justify-center rounded-lg bg-success/10">
                      <UIcon name="i-lucide-trending-down" class="size-3.5 text-success" />
                    </div>

                    <p class="text-[11px] text-muted">
                      Credit
                    </p>
                  </div>

                  <p class="mt-2 text-sm font-semibold text-success">
                    {{ item.credit ? format(item.credit) : '-' }}
                  </p>
                </div>

                <!-- Debit -->
                <div class="rounded-2xl border border-error/10 bg-error/5 px-3 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex size-7 items-center justify-center rounded-lg bg-error/10">
                      <UIcon name="i-lucide-trending-up" class="size-3.5 text-error" />
                    </div>

                    <p class="text-[11px] text-muted">
                      Debit
                    </p>
                  </div>

                  <p class="mt-2 text-sm font-semibold text-error">
                    {{ item.debit ? format(item.debit) : '-' }}
                  </p>
                </div>
              </div>
            </div>
            <template #footer>
              <div class="flex items-end justify-between">
                <!-- Balance -->
                <div>
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-wallet" class="size-3.5 text-muted" />

                    <p class="text-[11px] text-muted">
                      Running Balance
                    </p>
                  </div>

                  <p class="mt-1 text-base font-bold text-info">
                    {{ format(item.balance || 0) }}
                  </p>
                </div>

                <!-- Date -->
                <div class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <UIcon name="i-lucide-calendar-days" class="size-3.5 text-muted" />

                    <p class="text-[11px] text-muted">
                      Date
                    </p>
                  </div>

                  <p class="mt-1 text-xs font-medium text-highlighted">
                    {{ item.date }}
                  </p>
                </div>
              </div>
            </template>
          </UCard>
        </div>
        <div v-if="view === 'card'"  class="flex space-x-2 justify-between p-4 border-t border-gray-200">
          <div>
            <p class="text-xs font-medium text-muted">
              Total:
            </p>

            <p class="mt-1 text-xl font-bold text-highlighted">
              {{ format(total.finalBalance || 0) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-muted">
              Credit:
            </p>

            <p class="mt-1 text-xl font-bold text-success">
              {{ format(total.totalCredit || 0) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-muted">
              Debit:
            </p>

            <p class="mt-1 text-xl font-bold text-error">
              {{ format(total.totalDebit || 0) }}
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
