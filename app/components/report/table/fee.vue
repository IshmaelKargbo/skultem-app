<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { format } = useMoney()
const { fees: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns: TableColumn<TeacherSubject> = [
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'clazz',
    header: 'Class'
  },
  {
    accessorKey: 'fee',
    header: 'Fee'
  },
  {
    accessorKey: 'term',
    header: 'Term'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }: any) => format(row.original.amount)
  },
  {
    accessorKey: 'amountPaid',
    header: 'Amount Paid',
    cell: ({ row }: any) => format(row.original.amountPaid)
  },
  {
    accessorKey: 'outstanding',
    header: 'Outstanding',
    cell: ({ row }: any) => format(row.original.outstanding)
  },
  {
    accessorKey: 'status',
    header: 'Status'
  }
]

const parseStateColor: Record<string, string> = {
  "Paid": "success",
  "Overdue": "error",
  "Pending": "warning"
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
      <template #state-cell="{ row }">
        <UBadge :label="row.original.state" variant="outline" :color="parseStateColor[row.original.state]" />
      </template>
      <template #amount-cell="{ row }">
        <p class="text-info">{{ format(row.original.amount) }}</p>
      </template>
      <template #amountPaid-cell="{ row }">
        <p class="text-success">{{ format(row.original.amountPaid) }}</p>
      </template>
      <template #outstanding-cell="{ row }">
        <p class="text-error">{{ format(row.original.outstanding) }}</p>
      </template>
      <template #status-cell="{ row }">
        <UBadge :label="row.original.status" variant="outline" :color="parseStateColor[row.original.status]" />
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
          <p class="text-xs text-muted">{{ item.clazz }} · {{ item.fee }} · {{ item.term }}</p>
          <p class="text-xs text-info">Amount: {{ format(item.amount) }}</p>
          <p class="text-xs text-success">Paid: {{ format(item.amountPaid) }}</p>
          <div class="flex items-center justify-between">
            <p class="text-xs text-error">Outstanding: {{ format(item.outstanding) }}</p>
            <UBadge :label="item.status" variant="outline" :color="parseStateColor[item.status]" size="sm" />
          </div>
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
