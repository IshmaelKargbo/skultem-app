<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  student: Student
  refreshKey?: number
}>()

const { format } = useMoney()
const store = useStudentStore()

const loading = ref(false)
const records = ref<StudentFee[]>([])

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

const columns: TableColumn<StudentFee>[] = [
  {
    accessorKey: 'feeName',
    header: 'Category',
    cell: ({ row }) => {
      return `${row.original.feeName} (${row.original.term})`
    }
  },
  {
    accessorKey: 'total',
    header: 'Amount',
    cell: ({ row }) => format(row.original.total)
  },
  {
    accessorKey: 'paid',
    header: 'Paid',
    cell: ({ row }) => format(row.original.paid)
  },
  {
    accessorKey: 'outstanding',
    header: 'Outstanding',
    cell: ({ row }) => format(row.original.outstanding)
  },
  {
    accessorKey: 'discount',
    header: 'Discount'
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  }
]

const parseStatusColor: Record<string, string> = {
  "Paid": "success",
  "Partial": "warning",
  "Overdue": "error",
  "Unpaid": "neutral"
}

const columnPinning = ref({
  left: ['feeName'],
  right: ['status']
})
</script>

<template>
  <div class="space-y-3">
    <div v-if="loading" class="space-y-2 md:hidden">
      <UCard v-for="n in 4" :key="n" class="rounded-2xl" :ui="{ body: 'p-4' }">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <USkeleton class="h-8 w-full rounded-lg" />
            <USkeleton class="h-8 w-full rounded-lg" />
            <USkeleton class="h-8 w-full rounded-lg" />
            <USkeleton class="h-8 w-full rounded-lg" />
          </div>
        </div>
      </UCard>
    </div>

    <div v-else-if="records.length === 0" class="rounded-2xl border border-dashed border-gray-200 p-10 text-center dark:border-gray-800">
      <div class="flex flex-col items-center gap-2">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
        <p class="text-gray-500 dark:text-gray-400">
          No fee found.
        </p>
      </div>
    </div>

    <div v-else class="space-y-2 md:hidden">
      <UCard
        v-for="item in records"
        :key="item.id"
        class="rounded-2xl border border-gray-200 dark:border-gray-800"
        :ui="{ body: 'p-4' }"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {{ item.feeName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ item.term }}
              </p>
            </div>
            <UBadge variant="soft" :color="parseStatusColor[item.status]" :label="item.status" />
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
              <p class="text-gray-500">Amount</p>
              <p class="mt-0.5 font-semibold text-gray-900 dark:text-white">{{ format(item.total) }}</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
              <p class="text-gray-500">Paid</p>
              <p class="mt-0.5 font-semibold text-success-500">{{ format(item.paid) }}</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
              <p class="text-gray-500">Outstanding</p>
              <p class="mt-0.5 font-semibold text-orange-500">{{ format(item.outstanding) }}</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
              <p class="text-gray-500">Discount</p>
              <p class="mt-0.5 font-semibold text-purple-500">{{ format(item.discount || 0) }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500 dark:border-gray-800">
            <span>Due Date</span>
            <span class="font-medium text-gray-700 dark:text-gray-300">{{ item.dueDate || '-' }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <UTable v-model:column-pinning="columnPinning" :columns="columns" :data="records" :loading="loading" class="hidden md:block">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400 dark:text-gray-500" />
          <p class="text-gray-500 dark:text-gray-400">No fee found.</p>
        </div>
      </template>
      <template #paid-cell="{ row }">
        <p class="text-success-400">{{ format(row.original.paid) }}</p>
      </template>
      <template #outstanding-cell="{ row }">
        <p class="text-orange-400">{{ format(row.original.outstanding) }}</p>
      </template>
      <template #discount-cell="{ row }">
        <p class="text-purple-400">{{ format(row.original.discount || 0) }}</p>
      </template>
      <template #status-cell="{ row }">
        <UBadge variant="outline" :color="parseStatusColor[row.original.status]" :label="row.original.status" />
      </template>
    </UTable>
  </div>
</template>
