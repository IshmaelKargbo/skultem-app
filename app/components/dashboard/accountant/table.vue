<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const store = useFeePaymentStore()
const loading = ref(true)
const { format } = useMoney()
const { records: data } = storeToRefs(store)

const columns: TableColumn<Ledger> = [
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

async function fetchRecord() {
  loading.value = true
  await store.fetchAll(1, 5)
  loading.value = false
}

onMounted(async () => {
  fetchRecord()
})
</script>

<template>
  <UCard>
    <div class="space-y-2">
      <div class="flex justify-between">
        <p class="font-semibold font-display text-base">Recent Transactions</p>
        <UBadge color="neutral" :label="formatDateString(new Date().toISOString())" variant="outline" />
      </div>
      <UTable :columns="columns" :data="data" :loading="loading" :ui="{
        tfoot: 'bg-app-50/10'
      }">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No ledger record found.</p>
          </div>
        </template>
        <template #debit-cell="{ row }">
          <p class="text-error font-semibold">{{ row.original.debit ? format(row.original.debit || 0) : '-' }}</p>
        </template>
        <template #student-cell="{ row }">
          <div class="flex space-x-3">
            <div>
              <UAvatar :alt="row.original.student" />
            </div>
            <div>
              <p>{{ row.original.student }}</p>
              <p class="text-xs text-mute">{{ formatDateTime(row.original.createdAt) }}</p>
            </div>
          </div>
        </template>
        <template #paymentMethod-cell="{ row }">
          <UBadge variant="outline" :color="paymentMethods[row.original.paymentMethod].color"
            :label="` - ${paymentMethods[row.original.paymentMethod].label}`"
            :icon="paymentMethods[row.original.paymentMethod].icon" />
        </template>
        <template #fee-cell="{ row }">
          <UBadge variant="outline" color="info" :label="row.original.fee" />
        </template>
        <template #amount-cell="{ row }">
          <p class="font-semibold">{{ format(row.original.amount || 0) }}</p>
        </template>
        <template #referenceNo-cell="{ row }">
          <p class="font-medium">{{ row.original.referenceNo }}</p>
        </template>
      </UTable>
    </div>
  </UCard>
</template>
