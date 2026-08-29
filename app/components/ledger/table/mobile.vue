<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const ledgerStore = useLedgerStore()
const academicYearStore = useAcademicYearStore()
const { format } = useMoney()
const { ledger: data, meta, loading, report } = storeToRefs(store)
const { total } = storeToRefs(ledgerStore)
const { termList } = storeToRefs(academicYearStore)

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
  // LedgerTable (rendered alongside this one, self-hiding by breakpoint) watches this same route
  // query and reacts to page changes identically - without this guard, every page change fires
  // two concurrent runReport calls for the two of them, and whichever resolves last silently
  // wins even if it was the stale one.
  if (loading.value) return

  loading.value = true
  await store.runReport(report.value, page.value, size.value)
  loading.value = false
}

watch(() => page.value, () => {
  fetchRecord()
}, { immediate: true })

onMounted(async () => {
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
  <div class="space-y-3 md:hidden">
    <TransactionFilters :selected="selected" />

    <!-- Empty -->
    <div v-if="!loading && !data?.length" class="flex flex-col items-center justify-center py-16">
      <div class="flex size-20 items-center justify-center rounded-3xl bg-muted">
        <UIcon name="ph:books-light" class="text-4xl text-muted" />
      </div>

      <p class="mt-4 text-sm text-muted">
        No ledger records found
      </p>
    </div>

    <!-- Transactions -->
    <template v-else>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <div>
          <div v-for="item in data" :key="`${item.date}-${item.student}-${item.type}`"
            class="px-4 py-3 border-b border-gray-200 last:border-0">
            <!-- Header -->
            <div class="flex items-start justify-between gap-3">

              <div class="min-w-0 flex-1">
                <div class="min-w-0 space-y-1">
                  <h3 class="truncate text-sm font-semibold text-highlighted">
                    {{ item.student || 'No Student' }}
                  </h3>

                  <div class="flex space-x-2 items-center">
                    <p class="text-xs text-muted">
                      {{ item.clazz }}
                    </p>
                    <p>{{ DOT }}</p>
                    <p class="text-xs text-muted">
                      {{ clean(item.type) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="space-y-1">
                <div class="justify-end flex">
                  <p class="font-semibold text-info">
                    {{ format(item.balance || 0) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <p class="font-semibold" :class="item.credit ? 'text-success' : 'text-error'">
                    {{
                      item.credit
                        ? format(item.credit)
                        : format(item.debit || 0)
                    }}
                  </p>
                  <p>{{ DOT }}</p>
                  <UBadge size="sm" variant="soft" :label="parseType[item.type]" :color="parseTypeColor[item.type]" />
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 px-4 py-3">
            <div>
              <p class="text-[11px] text-muted">
                Debit
              </p>

              <p class="font-bold text-error">
                {{ format(total.totalDebit || 0) }}
              </p>
            </div>

            <div class="flex flex-col items-center">
              <p class="text-[11px] text-muted">
                Credit
              </p>

              <p class="font-bold text-success">
                {{ format(total.totalCredit || 0) }}
              </p>
            </div>

            <div class="flex flex-col items-end">
              <p class="text-[11px] text-muted">
                Balance
              </p>

              <p class="font-bold text-info">
                {{ format(total.finalBalance || 0) }}
              </p>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex flex-col items-center gap-3">
            <Showing :meta="meta" />
            <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
              :total="meta.total" show-edges />
          </div>
        </template>
      </UCard>
    </template>
  </div>
</template>
