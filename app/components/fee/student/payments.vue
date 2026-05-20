<template>

    <UCard :ui="{
        body: 'sm:p-0'
    }">
        <template #header>
            <div class="flex justify-between items-center">
                <p>Payment History</p>
                <UBadge variant="outline" :label="`${meta?.total} Payment(s)`" />
            </div>
        </template>
        <div v-if="!student" class="border border-dashed rounded-lg p-4 text-sm text-muted">
            Select a student to view payment history.
        </div>
        <div v-else class="space-y-4">
            <div v-if="isLoading" class="space-y-3">
                <UCard v-for="n in 3" :key="n">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <USkeleton class="w-40 h-3" />
                            <USkeleton class="w-20 h-3" />
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <USkeleton class="w-32 h-3" />
                            <USkeleton class="w-24 h-3" />
                        </div>
                    </div>
                </UCard>
            </div>

            <div v-else-if="filtered.length === 0"
                class="text-mute border-2 m-3 border-dashed border-gray-100 rounded-xl dark:border-gray-800  flex h-40 w-full justify-center items-center">
                No payments found
            </div>

            <div v-else>
                <UTable :columns="columns" :data="records" :loading="isLoading">
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
            </div>


        </div>
        <template #footer>
            <div class="flex justify-between items-center">
                <Showing :meta="meta" />
                <UPagination v-if="meta && !isLoading" size="sm" v-model:page="page" :page-size="meta.size"
                    :items-per-page="meta.size" :total="meta.total" show-edges />
            </div>
        </template>
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

const page = ref(1)

const columns = [
    {
        accessorKey: 'paidAt',
        header: 'Date',
        cell: ({ row }: any) => formatDateTime(row.original.paidAt) || '-'
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

const records = ref<FeePayment[]>([])
const meta = ref<Meta>()
const size = ref(6)


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
        console.log(res);

        records.value = res?.records || []
        meta.value = res?.meta
    } finally {
        isLoading.value = false
    }
}

watch(
    () => [props.student?.id, page.value],
    async ([studentId, currentPage]) => {
        if (!studentId) return
        await fetchPayments()
    },
    { immediate: false }
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
