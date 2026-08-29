<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { format } = useMoney()
const { payments: data, meta, loading, report } = storeToRefs(store)

const columns = [
  { accessorKey: 'paidAt', header: 'Date' },
  { accessorKey: 'student', header: 'Student' },
  { accessorKey: 'fee', header: 'Fee' },
  { accessorKey: 'term', header: 'Term' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'paymentMethod', header: 'Method' },
  { accessorKey: 'referenceNo', header: 'Reference' },
]

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
  // TransactionFilters (rendered by ReportHeader above) also runs a report whenever a filter is
  // applied - without this guard, a filter change and a page change landing at the same time
  // would fire two concurrent fetches, and whichever resolved last would win even if stale.
  if (loading.value) return

  loading.value = true
  await store.runReport(report.value, page.value, size.value)
  loading.value = false
}

watch(() => page.value, fetchRecord)

// The filter bar's own onMounted already runs the initial (unfiltered) report - once that lands
// and report.value is set, fetch again if we were on a page other than 1 (report/store.ts's
// runReport is always called with page 1 internally by the filter bar's initial run).
watch(report, () => {
  if (page.value !== 1) fetchRecord()
})

onMounted(() => {
  if (!route.query.page) {
    router.replace({ query: { ...route.query, page: page.value } })
  }
})
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }">
    <UTable :columns="columns" :data="data" :loading="loading" class="w-full">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No payments found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #paidAt-cell="{ row }">
        {{ formatDate(row.original.paidAt) }}
      </template>
      <template #amount-cell="{ row }">
        <p class="font-semibold text-success">{{ format(row.original.amount) }}</p>
      </template>
      <template #paymentMethod-cell="{ row }">
        <UBadge variant="outline" :label="parsePaymentMethod[row.original.paymentMethod] || row.original.paymentMethod" />
      </template>
      <template #referenceNo-cell="{ row }">
        {{ row.original.referenceNo || '-' }}
      </template>
    </UTable>
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
</template>
