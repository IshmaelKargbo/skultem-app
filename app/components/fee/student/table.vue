<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const props = defineProps<{
  student: Student
}>()

const { format } = useMoney()
const store = useStudentStore()

const loading = ref(false)
const records = ref<StudentFee[]>([])

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

let requestId = 0

async function fetchData() {
  if (!props.student?.id) return

  const id = ++requestId
  loading.value = true
  records.value = []

  const res = await store.getAllStudentFeesById(
    props.student.id
  )

  if (id !== requestId) return

  if (res) {
    records.value = res.records ?? []
  }

  loading.value = false
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
  },
  {
    id: 'actions',
    meta: {
      class: { td: 'text-right' }
    },
    cell: ({ row }) =>
      h(
        UDropdownMenu,
        {
          content: { align: 'end' },
          size: 'sm',
          items: getRowItems(row)
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            size: 'sm',
            variant: 'ghost'
          })
      )
  }
]

function getRowItems(row: Row<StudentFee>) {
  return [
    {
      label: 'Edit Record',
      icon: 'i-lucide-edit',
      onClick: () => {
        console.log('Edit:', row.original)
      }
    },
    {
      label: 'Delete Record',
      icon: 'i-lucide-trash',
      onClick: () => {
        console.log('Delete:', row.original)
      }
    }
  ]
}

const parseStatusColor: Record<string, string> = {
  "Paid": "success",
  "Partial": "warning",
  "Overdue": "error",
  "Unpaid": "neutral"
}

const columnPinning = ref({
  left: ['feeName'],
  right: ['actions']
})
</script>

<template>
  <UTable v-model:column-pinning="columnPinning" :columns="columns" :data="records" :loading="loading">
    <template #empty-state>
      <div class="flex flex-col items-center gap-2 py-10">
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
        <p class="text-gray-500">No fee found.</p>
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
</template>