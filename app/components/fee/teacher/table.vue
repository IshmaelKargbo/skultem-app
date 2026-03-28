<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { format } = useMoney()

const { fees: data, report, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const columns: TableColumn<Fee>[] = [
  {
    accessorKey: 'student',
    header: 'Student'
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
    header: 'Amount'
  },
  {
    accessorKey: 'amountPaid',
    header: 'Amount Paid'
  },
  {
    accessorKey: 'outstanding',
    header: 'Outstanding'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  }
]

const parseStateColor: Record<string, string> = {
  Paid: 'success',
  Partial: 'warning',
  Pending: 'error'
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
  router.replace({
    query: { ...route.query, ...newQuery }
  })
}

async function fetchReport() {
  if (!report.value) return
  await store.runReport(report.value, page.value, size.value)
}

watch(page, async () => {

  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })

  await fetchReport()

}, { immediate: true })
</script>

<template>
  <UCard>

    <UTable
      :columns="columns"
      :data="data"
      :loading="loading"
    >

      <!-- Empty State -->
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:wallet-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No fee records found.</p>
        </div>
      </template>

      <!-- Amount -->
      <template #amount-cell="{ row }">
        <span class="text-info">
          {{ format(row.original.amount) }}
        </span>
      </template>

      <!-- Amount Paid -->
      <template #amountPaid-cell="{ row }">
        <span class="text-success">
          {{ format(row.original.amountPaid) }}
        </span>
      </template>

      <!-- Outstanding -->
      <template #outstanding-cell="{ row }">
        <span class="text-error">
          {{ format(row.original.outstanding) }}
        </span>
      </template>

      <!-- Status -->
      <template #status-cell="{ row }">
        <UBadge
          :label="row.original.status"
          variant="outline"
          :color="parseStateColor[row.original.status]"
        />
      </template>

    </UTable>

    <!-- Pagination -->
    <div
      v-if="meta"
      class="flex justify-between border-t border-gray-200 pt-3 items-center"
    >
      <Showing :meta="meta" />

      <UPagination
        v-model:page="page"
        size="sm"
        :page-size="meta.size"
        :items-per-page="meta.size"
        :total="meta.total"
        show-edges
      />

    </div>

  </UCard>
</template>