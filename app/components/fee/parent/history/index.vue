<template>
  <UCard :ui="{
        body: 'sm:p-0'
    }">
    <template #header>
      <div>
        <p>Payment History</p>
      </div>
    </template>
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:receipt-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No payment found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
    </UTable>
  </UCard>
</template>

<script lang="ts" setup>
const { format } = useMoney()
const studentStore = useStudentStore()
const { student } = defineProps<{
  student: string
}>()
const loading = ref(true)

const data = ref<any>([])

const columns = [
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
  if (!student) return
  loading.value = true
  data.value = []
  try {
    const res = await studentStore.getPaymentHistoryByStudent(student)
    data.value = res?.records ?? []
  } finally {
    loading.value = false
  }
}

watch(() => student, fetchRecord, { immediate: true })
</script>