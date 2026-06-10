<script setup lang="ts">
const store = useFeePaymentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

const page = ref(1)

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
    header: 'Amount'
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Method'
  },
  {
    accessorKey: 'referenceNo',
    header: 'Reference No',
    cell: ({ row }: any) => row.original.referenceNo || '-'
  }
]

watch(() => page.value, () => {
  fetchRecord()
}, { immediate: true })

async function fetchRecord() {
  await store.fetchAll(page.value, 6)
}

onMounted(async () => {
  fetchRecord()
})

defineExpose({
  fetchRecord
})
</script>

<template>
  <UCard :ui="{
    body: 'sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No ledger record found.</p>
        </div>
      </template>
      <template #student-cell="{ row }">
        <div class="flex space-x-3 items-center">
          <div>
            <UAvatar :src="row.original.student.photo" :alt="row.original.student" />
          </div>
          <div class="space-y-0.5">
            <p>{{ row.original.student }}</p>
            <p class="text-xs text-muted">{{ formatDateTime(row.original.createdAt) }}</p>
          </div>
        </div>
      </template>
      <template #paymentMethod-cell="{ row }">
        <UBadge variant="outline" :color="paymentMethods[row.original.paymentMethod].color"
          :label="` - ${paymentMethods[row.original.paymentMethod].label}`"
          :icon="paymentMethods[row.original.paymentMethod].icon" />
      </template>
      <template #amount-cell="{ row }">
        <p class="font-semibold">{{ format(row.original.amount || 0) }}</p>
      </template>
      <template #referenceNo-cell="{ row }">
        <p class="font-medium">{{ row.original.referenceNo || '-' }}</p>
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
  <!-- <ReceiptPayment v-if="receipt" id="payment-receipt" :receipt="receipt" /> -->
</template>
