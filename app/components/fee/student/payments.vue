<template>
    <UCard :ui="{
        body: 'sm:p-0'
    }">
        <template #header>
            <div class="flex justify-between items-center">
                <p>Payment History</p>
                <UBadge variant="outline" :label="`${meta?.total || 0} Payment(s)`" />
            </div>
        </template>
        <div v-if="!student" class="border border-dashed rounded-lg p-4 text-sm text-muted">
            Select a student to view payment history.
        </div>
        <div v-else class="space-y-4">
            <div v-if="isLoading" class="space-y-3">
                <UCard v-for="n in 3" :key="n" class="md:hidden rounded-2xl" :ui="{ body: 'p-4' }">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <USkeleton class="h-4 w-28" />
                            <USkeleton class="h-6 w-16 rounded-full" />
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <USkeleton class="h-8 w-full rounded-lg" />
                            <USkeleton class="h-8 w-full rounded-lg" />
                            <USkeleton class="h-8 w-full rounded-lg col-span-2" />
                        </div>
                    </div>
                </UCard>
                <div class="hidden md:block">
                    <UTable :columns="columns" :data="[]" :loading="true" />
                </div>
            </div>

            <div v-else-if="records.length === 0" class="p-3">
                <div
                    class="text-mute border-2 border-dashed border-gray-100 rounded-xl dark:border-gray-800  flex h-40 w-full justify-center items-center">
                    No payments found
                </div>
            </div>

            <div v-else>
                <div class="space-y-2 md:hidden">
                    <UCard v-for="item in records" :key="item.id" class="rounded-2xl border border-gray-200 dark:border-gray-800"
                        :ui="{ body: 'p-4' }">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between gap-2">
                                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                                    {{ format(item.amount || 0) }}
                                </p>
                                <UBadge variant="soft" :color="paymentMethods[item.paymentMethod]?.color || 'neutral'"
                                    :label="paymentMethods[item.paymentMethod]?.label || item.paymentMethod" />
                            </div>

                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                                    <p class="text-gray-500">Date</p>
                                    <p class="mt-0.5 font-medium text-gray-800 dark:text-gray-200">
                                        {{ formatDateTime(item.paidAt) || '-' }}
                                    </p>
                                </div>
                                <div class="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                                    <p class="text-gray-500">Reference</p>
                                    <p class="mt-0.5 truncate font-medium text-gray-800 dark:text-gray-200">
                                        {{ item.referenceNo || '-' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>

                <UTable class="hidden md:block" :columns="columns" :data="records" :loading="isLoading">
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
    }
)
</script>
