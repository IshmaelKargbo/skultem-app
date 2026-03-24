<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const store = useLedgerStore()
const loading = ref(true)
const { format } = useMoney()
const { records: data, meta, total } = storeToRefs(store)

const columns: TableColumn<Ledger> = [
  {
    accessorKey: 'date',
    header: 'Date'
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'student',
    header: 'Student'
  },
  {
    accessorKey: 'clazz',
    header: 'Class'
  }
]

const parseType: Record<string, string> = {
  "FEE_ASSINMENT": "Fee Assignment",
  "DISCOUNT": "Discount",
  "PAYMENT": "Payment",
}

const parseTypeColor: Record<string, string> = {
  "FEE_ASSINMENT": "neutral",
  "DISCOUNT": "info",
  "PAYMENT": "success",
}

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
    <div class="space-y-5">
      <p class="font-semibold">Recent Transactions</p>
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
        <template #debit-footer>
          <p class="text-error font-semibold">{{ format(total.totalDebit || 0) }}</p>
        </template>
        <template #credit-cell="{ row }">
          <p class="text-success font-semibold">{{ row.original.credit ? format(row.original.credit || 0) : '-' }}</p>
        </template>
        <template #credit-footer>
          <p class="text-success font-semibold">{{ format(total.totalCredit || 0) }}</p>
        </template>
        <template #type-cell="{ row }">
          <UBadge variant="subtle" :color="parseTypeColor[row.original.type]" :label="parseType[row.original.type]" />
        </template>
        <template #balance-cell="{ row }">
          <p class="text-info font-semibold">{{ format(row.original.balance || 0) }}</p>
        </template>
        <template #balance-footer>
          <p class="text-info font-semibold">{{ format(total.finalBalance || 0) }}</p>
        </template>
        <template #date-footer>
          <p>Total</p>
        </template>
      </UTable>
    </div>
  </UCard>
</template>
