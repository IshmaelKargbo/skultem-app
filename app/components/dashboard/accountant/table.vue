<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const store = useFeePaymentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)

const page = ref(1)
const receiptViewer = ref()

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
    accessorKey: 'paymentMethod',
    header: 'Method'
  },
  {
    accessorKey: 'referenceNo',
    header: 'Reference No'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    meta: { class: { th: 'text-right', td: 'text-right' } }
  },
  {
    id: 'actions',
    meta: { class: { td: 'text-right' } }
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
  <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex items-center justify-between px-4 py-3">
        <div>
          <p>Recent Payments</p>
          <p class="text-xs text-muted">Latest school fees received</p>
        </div>
        <TableViewToggle v-model="view" />
      </div>
    </template>

    <!-- Desktop table -->
    <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No payments found.</p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #student-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar :src="row.original.photo" :alt="row.original.student" loading="lazy" />
          <div class="space-y-1">
            <p class="font-medium">{{ row.original.student }}</p>
            <p class="text-xs text-muted">{{ formatDateTime(row.original.createdAt) }}</p>
          </div>
        </div>
      </template>

      <template #fee-cell="{ row }">
        <p class="text-muted">{{ row.original.fee }}</p>
      </template>

      <template #paymentMethod-cell="{ row }">
        <UBadge variant="subtle" :color="paymentMethods[row.original.paymentMethod].color"
          :label="paymentMethods[row.original.paymentMethod].label"
          :icon="paymentMethods[row.original.paymentMethod].icon" />
      </template>

      <template #referenceNo-cell="{ row }">
        <p class="font-mono text-xs text-muted">{{ row.original.referenceNo || '-' }}</p>
      </template>

      <template #amount-cell="{ row }">
        <p class="font-semibold text-success">+ {{ format(row.original.amount || 0) }}</p>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="ghost"
            @click="receiptViewer?.view(row.original.referenceNo)" />
          <UButton icon="i-lucide-download" size="xs" color="neutral" variant="ghost"
            :loading="receiptViewer?.downloading" @click="receiptViewer?.download(row.original.referenceNo)" />
        </div>
      </template>
    </UTable>

    <!-- Mobile list: one clean row per payment -->
    <div v-if="view === 'table'" class="md:hidden">
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="border-b border-default px-4 py-3 last:border-0">
          <div class="flex items-center justify-between gap-3">
            <div class="space-y-2">
              <USkeleton class="h-4 w-28" />
              <USkeleton class="h-3 w-36" />
            </div>
            <div class="space-y-2">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="ml-auto h-3 w-16" />
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="data?.length">
        <div v-for="record in data" :key="record.id"
          class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
          <div class="min-w-0 space-y-1">
            <p class="truncate text-sm font-semibold text-highlighted">{{ record.student }}</p>
            <div class="flex items-center gap-2 text-xs text-muted">
              <p class="truncate">{{ record.fee }}</p>
              <p>·</p>
              <p class="shrink-0">{{ formatDate(record.createdAt) }}</p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <div class="space-y-1 text-right">
              <p class="text-sm font-bold text-success">+ {{ format(record.amount || 0) }}</p>
              <p class="text-xs text-muted">{{ paymentMethods[record.paymentMethod].label }}</p>
            </div>
            <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="ghost"
              @click="receiptViewer?.view(record.referenceNo)" />
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center gap-2 py-12">
        <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
        <p class="text-sm text-gray-500">No payments found.</p>
      </div>
    </div>

    <!-- Card view -->
    <div v-if="view === 'card'" class="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 lg:grid-cols-3">
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i">
          <div class="animate-pulse space-y-3">
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-3 w-36" />
            <USkeleton class="h-6 w-24" />
          </div>
        </UCard>
      </template>

      <template v-else-if="data?.length">
        <UCard v-for="record in data" :key="record.id" class="overflow-hidden rounded-xl">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar :src="record.photo" :alt="record.student" loading="lazy" />
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted">{{ record.student }}</p>
                  <p class="mt-1 text-xs text-muted">{{ record.fee }} · {{ formatDate(record.createdAt) }}</p>
                </div>
              </div>
              <UBadge size="sm" variant="subtle" :color="paymentMethods[record.paymentMethod].color"
                :icon="paymentMethods[record.paymentMethod].icon"
                :label="paymentMethods[record.paymentMethod].label" />
            </div>

            <div class="flex items-end justify-between border-t border-default pt-3">
              <div>
                <p class="text-[11px] uppercase tracking-wide text-muted">Amount</p>
                <p class="font-display text-lg font-semibold text-success">+ {{ format(record.amount || 0) }}</p>
              </div>
              <div class="flex items-center gap-1">
                <p class="mr-1 font-mono text-xs text-muted">{{ record.referenceNo || '-' }}</p>
                <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="ghost"
                  @click="receiptViewer?.view(record.referenceNo)" />
                <UButton icon="i-lucide-download" size="xs" color="neutral" variant="ghost"
                  :loading="receiptViewer?.downloading" @click="receiptViewer?.download(record.referenceNo)" />
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
        <UIcon name="i-lucide-receipt" class="text-4xl text-gray-400" />
        <p class="text-sm text-gray-500">No payments found.</p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>

  <ReceiptViewer ref="receiptViewer" />
</template>
