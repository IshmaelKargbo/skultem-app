<script setup lang="ts">
const props = defineProps<{
  student: Student
  refreshKey?: number
  embedded?: boolean
}>()

const { format } = useMoney()
const store = useStudentStore()

const loading = ref(true)
const records = ref<any[]>([])

let requestId = 0

async function fetchData() {
  if (!props.student?.id) return

  const id = ++requestId
  loading.value = true

  try {
    const res = await store.getAllStudentFeesById(props.student.id)

    if (id !== requestId) return

    if (res) {
      records.value = res.records ?? []
    }
  } finally {
    if (id === requestId) {
      loading.value = false
    }
  }
}

watch(
  () => props.student?.id,
  async (newId, oldId) => {
    if (!newId || newId === oldId) return

    records.value = []

    await fetchData()
  },
  { immediate: true }
)

watch(
  () => props.refreshKey,
  async () => {
    await fetchData()
  }
)

const columns = [
  {
    accessorKey: 'feeName',
    header: 'Category'
  },
  {
    accessorKey: 'total',
    header: 'Amount',
    cell: ({ row }: any) => format(row.original.amount)
  },
  {
    accessorKey: 'paid',
    header: 'Paid',
    cell: ({ row }: any) => format(row.original.amountPaid || 0)
  },
  {
    accessorKey: 'outstanding',
    header: 'Outstanding',
    cell: ({ row }: any) => format(row.original.outstanding)
  },
  {
    accessorKey: 'discount',
    header: 'Discount'
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date'
  }
]

const parseStatusColor: Record<string, string> = {
  "Paid": "text-success",
  "Partial": "text-warning",
  "Overdue": "text-error",
  "Unpaid": "text-muted"
}

const parseBatchStatusColor: Record<string, string> = {
  "Paid": "success",
  "Partial": "warning",
  "Overdue": "error",
  "Unpaid": "neutral"
}
</script>

<template>
  <div class="space-y-3">
    <div class="md:hidden">
      <UCard :ui="embedded ? {
        root: 'ring-0 shadow-none rounded-none bg-transparent',
        body: 'sm:p-0 p-0'
      } : {
        body: 'sm:p-0 p-0'
      }">
        <!-- Embedded (mobile modal): the parent already labels this section, so no header here. -->
        <template v-if="!embedded" #header>
          <p>Fees</p>
          <p class="text-xs text-muted">Assigned fee categories and payment status</p>
        </template>

        <!-- Loading -->
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="border-b px-4 py-3 border-gray-200 last:border-0">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-24" />
              </div>
              <div class="space-y-2">
                <div class="flex justify-end">
                  <USkeleton class="h-6 w-20 rounded-full" />
                </div>
                <USkeleton class="h-3 w-16" />
              </div>
            </div>
          </div>
        </template>

        <!-- Records -->
        <template v-else-if="records.length">
          <div v-for="item in records" :key="item.id" class="border-b px-4 py-3 border-gray-200 last:border-0">
            <div class="flex items-center justify-between">
              <div class="min-w-0 space-y-1">
                <h3 class="truncate text-sm font-semibold">
                  {{ item.fee }}
                </h3>
                <div class="flex space-x-2 items-center text-xs text-muted">
                  <p>{{ item.term }}</p>
                  <p>·</p>
                  <p>{{ item.dueDate ? formatDate(item.dueDate) : 'No due date' }}</p>
                </div>
              </div>

              <div class="space-y-1 text-right">
                <p class="text-sm font-bold text-info">
                  {{ format(item.total | 0) }}
                </p>
                <UBadge size="sm" variant="soft" :color="parseBatchStatusColor[item.status]" :label="item.status" />
              </div>
            </div>

            <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p class="text-muted">Paid</p>
                <p class="font-semibold text-success">{{ format(item.amountPaid || 0) }}</p>
              </div>
              <div>
                <p class="text-muted">Outstanding</p>
                <p class="font-semibold text-warning">{{ format(item.outstanding || 0) }}</p>
              </div>
              <div>
                <p class="text-muted">Discount</p>
                <p class="font-semibold text-purple-500">{{ format(item.discount || 0) }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <template v-else>
          <div class="flex flex-col items-center py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <UIcon name="ph:books-light" class="size-10 text-muted" />
            </div>

            <h3 class="mt-4 text-sm font-semibold">
              No fees found
            </h3>

            <p class="mt-1 text-sm text-muted">
              Assigned fee records will appear here.
            </p>
          </div>
        </template>
      </UCard>
    </div>

    <div class="hidden md:block">
      <UTable :columns="columns" :data="records" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
            <p class="text-gray-500 dark:text-gray-400">No fee found.</p>
          </div>
        </template>
        <template #feeName-cell="{ row }">
          <div>
            <p>{{ row.original.fee }}</p>
            <p class="text-muted text-xs">{{ row.original.term }}</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
        <template #dueDate-cell="{ row }">
          <div>
            <p class="text-right">{{ formatDate(row.original.dueDate) }}</p>
            <p class="text-xs text-right" :class="[parseStatusColor[row.original.status]]">{{ row.original.status }}</p>
          </div>
        </template>
        <template #paid-cell="{ row }">
          <p class="text-success-400">{{ format(row.original.amountPaid || 0) }}</p>
        </template>
        <template #outstanding-cell="{ row }">
          <p class="text-orange-400">{{ format(row.original.outstanding || 0) }}</p>
        </template>
        <template #discount-cell="{ row }">
          <p class="text-purple-400">{{ format(row.original.discount || 0) }}</p>
        </template>
      </UTable>
    </div>
  </div>
</template>