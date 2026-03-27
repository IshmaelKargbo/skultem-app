<template>
  <UCard>
    <div class="space-y-5">
      <p class="text-base text-mute">Payment History</p>
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No payment found.</p>
          </div>
        </template>
      </UTable>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';
const { format } = useMoney()
const studentStore = useStudentStore()
const { student } = defineProps<{
  student: string
}>()
const loading = ref(true)

const data = ref<any>([])

const columns: TableColumn<any> = [
  {
    accessorKey: 'fee',
    header: 'Name'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }: any) => format(row.original.amount)
  },
  {
    accessorKey: 'paidAt',
    header: 'Paid On',
    cell: ({ row }: any) => formatDateString(row.original.paidAt)
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Method'
  },
  {
    accessorKey: 'referenceNo',
    header: 'Reference No'
  }
]

async function fetchRecord() {
  loading.value = true
  data.value = []
  const res = await studentStore.getPaymentHistoryByStudent(student)
  if (res == null) return

  data.value = res.records
  loading.value = false
}

watch(() => student, () => {
  fetchRecord()
})
</script>