<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { format } = useMoney()
const { payments: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns = [
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'fee',
    header: 'Fee'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }: any) => format(row.original.amount)
  },
  {
    accessorKey: 'paidAt',
    header: 'Paid On',
    cell: ({ row }: any) => formatDateTime(row.original.paidAt)
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Payment Method'
  },
  {
    accessorKey: 'referenceNo',
    header: 'Reference No'
  }
]

const parseMethod: Record<string, string> = {
  "CASH": "Cash",
  "BANK": "Bank Transfer",
  "MOBILE_MONEY": "Mobile Money"
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

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) {
    return
  }

  router.replace({ query: merged })
}

function fetchReport() {
  if (report.value == null) return
  store.runReport(report.value, page.value, size.value)
}

watch(() => page.value, async () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      ...route.query,
      page: page.value,
      size: size.value
    }
  })

  await fetchReport()
}, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <UCard class="hidden md:block">
      <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No Attendance found.</p>
        </div>
      </template>
      <template #amount-cell="{ row }">
        <p class="text-success">{{ format(row.original.amount) }}</p>
      </template>
      <template #paymentMethod-cell="{ row }">
        <p>{{ parseMethod[row.original.paymentMethod] }}</p>
      </template>
      </UTable>
      <div v-if="meta" class="flex justify-between border-t border-gray-200 pt-3 items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </UCard>

    <div class="space-y-3 md:hidden">
      <UCard v-for="item in data" :key="item.id" :ui="{ body: 'p-4' }">
        <div class="space-y-1">
          <p class="font-semibold text-sm">{{ item.student }}</p>
          <p class="text-xs text-muted">{{ item.fee }}</p>
          <p class="text-xs text-success">{{ format(item.amount) }}</p>
          <p class="text-xs text-muted">{{ formatDateTime(item.paidAt) }}</p>
          <p class="text-xs">{{ parseMethod[item.paymentMethod] || item.paymentMethod }} · {{ item.referenceNo || 'No Ref' }}</p>
        </div>
      </UCard>
      <div v-if="!loading && !data?.length" class="flex flex-col items-center gap-2 py-10">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
        <p class="text-gray-500">No Attendance found.</p>
      </div>
      <div v-if="meta" class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
      </div>
    </div>
  </div>
</template>
