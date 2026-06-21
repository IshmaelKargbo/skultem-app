<script setup lang="ts">
const store = useFeePaymentStore()
const { format } = useMoney()
const { records: data, meta, loading } = storeToRefs(store)
const { $generatePdf } = useNuxtApp()
const notify = useNotify()

const page = ref(1)
const receipt = ref<any | null>(null)
const downloadingReceiptId = ref<string | null>(null)

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
  },
  {
    accessorKey: 'actions',
    header: ''
  }
]

watch(() => page.value, () => {
  fetchRecord()
}, { immediate: true })

async function fetchRecord() {
  await store.fetchAll(page.value, 6)
}

async function downloadReceipt(record: any) {
  receipt.value = buildReceipt(record)
  downloadingReceiptId.value = record.id
  await nextTick()

  try {
    await $generatePdf('#existing-payment-receipt', `receipt-${sanitizeFilename(receipt.value.referenceNo)}`)
  } catch (error) {
    console.error('Receipt download failed:', error)
    notify.warning('Receipt download failed. Please try again.')
  } finally {
    receipt.value = null
    downloadingReceiptId.value = null
  }
}

function buildReceipt(record: any) {
  const payments = relatedPayments(record)
  const first = payments[0] || record
  const referenceNo = first.referenceNo || first.id || Date.now().toString()

  return {
    referenceNo,
    student: displayStudent(first.student),
    term: first.term || 'N/A',
    paymentMethod: first.paymentMethod,
    paidAt: first.paidAt || first.createdAt,
    payments,
    total: payments.reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0),
  }
}

function relatedPayments(record: any) {
  if (!record.referenceNo) return [record]

  return data.value.filter((payment: any) =>
    payment.referenceNo === record.referenceNo &&
    displayStudent(payment.student) === displayStudent(record.student) &&
    payment.paymentMethod === record.paymentMethod
  )
}

function displayStudent(student: any) {
  if (!student) return 'Student'
  if (typeof student === 'string') return student

  return [student.givenNames, student.familyName].filter(Boolean).join(' ') || student.name || 'Student'
}

function sanitizeFilename(value: string) {
  return String(value).replace(/[^a-z0-9-_]/gi, '-')
}

const parsePaymentMethod = computed(() =>
  Object.fromEntries(
    Object.entries(paymentMethods).map(([key, value]: any) => [key, value.label])
  )
)

onMounted(async () => {
  fetchRecord()
})

defineExpose({
  fetchRecord
})
</script>

<template>
  <UCard class="overflow-hidden" :ui="{ body: 'sm:p-0' }">
    <!-- Desktop Table -->
    <div class="hidden md:block">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No ledger record found.</p>
          </div>
        </template>

        <template #student-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar
              :src="row.original.student.photo"
              :alt="row.original.student"
            />
            <div>
              <p class="font-medium">{{ row.original.student }}</p>
              <p class="text-xs text-muted">
                {{ formatDateTime(row.original.createdAt) }}
              </p>
            </div>
          </div>
        </template>

        <template #paymentMethod-cell="{ row }">
          <UBadge
            variant="outline"
            :color="paymentMethods[row.original.paymentMethod].color"
            :label="paymentMethods[row.original.paymentMethod].label"
            :icon="paymentMethods[row.original.paymentMethod].icon"
          />
        </template>

        <template #amount-cell="{ row }">
          <p class="font-semibold">
            {{ format(row.original.amount || 0) }}
          </p>
        </template>

        <template #referenceNo-cell="{ row }">
          <p class="font-medium">
            {{ row.original.referenceNo || '-' }}
          </p>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-download"
            size="xs"
            color="neutral"
            variant="ghost"
            :loading="downloadingReceiptId === row.original.id"
            @click="downloadReceipt(row.original)"
          />
        </template>
      </UTable>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden">
      <div v-if="loading" class="space-y-3 p-4 sm:p-5">
        <USkeleton class="h-28 w-full rounded-xl" />
        <USkeleton class="h-28 w-full rounded-xl" />
        <USkeleton class="h-28 w-full rounded-xl" />
      </div>

      <div
        v-else-if="data?.length"
        class="space-y-3 "
      >
        <UCard
          v-for="record in data"
          :key="record.id"
          class="overflow-hidden border border-gray-200/80 dark:border-gray-800"
          :ui="{ body: 'p-4 sm:p-5' }"
        >
          <div class="space-y-4">
            <!-- Header -->
            <div class="flex items-start gap-3">
              <UAvatar
                :src="record.student.photo"
                :alt="record.student"
                size="lg"
              />

              <div class="min-w-0 flex-1 space-y-1">
                <p class="font-semibold truncate">
                  {{ record.student }}
                </p>

                <p class="text-xs text-muted">
                  {{ formatDateTime(record.createdAt) }}
                </p>
              </div>

              <UBadge
                variant="soft"
                color="success"
                class="shrink-0"
              >
                {{ format(record.amount || 0) }}
              </UBadge>
            </div>

            <!-- Details -->
            <div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <p class="text-muted text-xs">Fee</p>
                <p class="font-medium break-words">
                  {{ record.fee }}
                </p>
              </div>

              <div class="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <p class="text-muted text-xs">Reference</p>
                <p class="font-medium truncate">
                  {{ record.referenceNo || '-' }}
                </p>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between gap-3">
                <UBadge
                  variant="outline"
                  :color="paymentMethods[record.paymentMethod].color"
                  :icon="paymentMethods[record.paymentMethod].icon"
                  :label="paymentMethods[record.paymentMethod].label"
                  class="w-fit"
                />

                <UButton
                  icon="i-lucide-download"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  :loading="downloadingReceiptId === record.id"
                  @click="downloadReceipt(record)"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="flex flex-col items-center gap-2 py-10 px-4"
      >
        <UIcon
          name="ph:books-light"
          class="text-4xl text-gray-400"
        />
        <p class="text-gray-500">
          No ledger record found.
        </p>
      </div>
    </div>

    <template #footer>
      <div
        class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <Showing :meta="meta" />

        <UPagination
          v-model:page="page"
          size="sm"
          :page-size="meta.size"
          :items-per-page="meta.size"
          :total="meta.total"
          show-edges
          class="justify-center md:justify-end"
        />
      </div>
    </template>

  </UCard>
  <div v-if="receipt" class="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
    <ReceiptPayment
      id="existing-payment-receipt"
      :receipt="receipt"
      :parse-payment-method="parsePaymentMethod"
    />
  </div>
</template>
