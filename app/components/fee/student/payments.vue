<template>
  <UCard :ui="{
    body: 'sm:p-0'
  }">
    <div class="p-5">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-base font-semibold">Payment History</p>
          <p v-if="student" class="text-xs text-muted">
            {{ student.givenNames }} {{ student.familyName }}
          </p>
        </div>
        <UInput v-model="search" placeholder="Search payments" :disabled="isLoading" class="md:w-72" />
      </div>

      <div v-if="!student" class="border border-dashed rounded-lg p-4 text-sm text-muted">
        Select a student to view payment history.
      </div>

      <div v-else class="space-y-4">
        <UTable :columns="columns" :data="filtered" :loading="isLoading">
          <template #empty-state>
            <div
              class="text-mute  border border-dashed border-gray-100 dark:border-gray-700 flex h-40 w-full justify-center items-center">
              No payments found
            </div>
          </template>
          <template #amount-cell="{ row }">
            <p class="font-semibold text-success">{{ format(row.original.amount) }}</p>
          </template>
          <template #paymentMethod-cell="{ row }">
            <p>{{ parsePaymentMethod[row.original.paymentMethod] }}</p>
          </template>
          <template #paidAt-cell="{ row }">
            <p>{{ formatDate(row.original.paidAt) }}</p>
          </template>
          <template #referenceNo-cell="{ row }">
            <p class="text-gray-700 dark:text-gray-300">{{ row.original.referenceNo || '-' }}</p>
          </template>
        </UTable>

        <div class="flex justify-between items-center" v-if="meta && !isLoading">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  student: Student | null | undefined
}>()

const store = useStudentStore()
const { format } = useMoney()
const search = ref('')
const isLoading = ref(false)

const records = ref<FeePayment[]>([])
const meta = ref<Meta>()
const page = ref(1)
const size = ref(6)

const columns = [
  { accessorKey: 'fee', header: 'Category' },
  { accessorKey: 'term', header: 'Term' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'paymentMethod', header: 'Method' },
  { accessorKey: 'paidAt', header: 'Date' },
  { accessorKey: 'referenceNo', header: 'Reference' }
]

const filtered = computed(() => {
  if (!search.value) return records.value
  const q = search.value.toLowerCase()
  return records.value.filter((item) =>
    item.term?.toLowerCase().includes(q) ||
    item.fee?.toLowerCase().includes(q) ||
    item.referenceNo?.toLowerCase().includes(q)
  )
})

const fetchPayments = async () => {
  if (!props.student) return
  isLoading.value = true
  try {
    const res = await store.getPaymentHistoryByStudent(props.student.id, page.value, size.value)
    records.value = res?.records || []
    meta.value = res?.meta
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.student?.id, page.value],
  async ([studentId]) => {
    if (!studentId) return
    await fetchPayments()
  },
  { immediate: true }
)

watch(
  () => props.student?.id,
  () => {
    page.value = 1
    records.value = []
    meta.value = undefined
    search.value = ''
  }
)
</script>
