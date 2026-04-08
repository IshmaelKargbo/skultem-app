<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { transactions: data, meta, loading, report } = storeToRefs(store)
const { format } = useMoney()
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns: TableColumn<Teacher> = [
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
    <UCard :ui="{
      body: 'p-0 sm:p-0'
    }">
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
  </div>
</template>
