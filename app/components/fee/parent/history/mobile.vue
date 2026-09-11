<template>
    <UCard :ui="{
        body: 'sm:p-0 p-0'
    }">
        <template #header>
            <div class="flex items-center justify-between">
                <div>
                    <p>Payment History</p>
                    <p class="text-xs text-muted">Every payment recorded so far</p>
                </div>
                <UBadge v-if="!loading && data.length" :label="`${data.length} payments`" variant="subtle"
                    color="success" size="sm" />
            </div>
        </template>
        <div>
            <!-- Loading -->
            <template v-if="loading">
                <div v-for="i in 4" :key="i"
                    class="flex items-center justify-between gap-3 border-b px-4 py-3 border-gray-200 last:border-0 dark:border-gray-800">
                    <div class="flex gap-3 items-center">
                        <USkeleton class="size-9 shrink-0 rounded-xl" />
                        <div class="space-y-1.5">
                            <USkeleton class="h-3.5 w-28 rounded-md" />
                            <USkeleton class="h-3 w-24 rounded-md" />
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-1.5">
                        <USkeleton class="h-3.5 w-16 rounded-md" />
                        <USkeleton class="h-5 w-16 rounded-full" />
                    </div>
                </div>
            </template>

            <!-- Data -->
            <template v-else-if="data.length">
                <div v-for="(row, i) in data" :key="row.id ?? i"
                    class="border-b px-4 py-3 border-gray-200 last:border-0 dark:border-gray-800">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex gap-3 min-w-0 items-center">
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                                <UIcon :name="CHECK_ICON" class="size-4" />
                            </div>
                            <div class="min-w-0 space-y-0.5">
                                <h3 class="truncate text-sm font-semibold">{{ row.fee }}</h3>
                                <p class="text-xs text-muted">{{ formatDateString(row.paidAt) }}</p>
                            </div>
                        </div>
                        <div class="space-y-1 text-right shrink-0">
                            <p class="text-sm font-bold text-success">{{ format(row.amount) }}</p>
                            <UBadge size="sm" :label="parsePaymentMethod[row.paymentMethod]" variant="subtle"
                                color="neutral" />
                        </div>
                    </div>
                </div>
            </template>

            <!-- Empty -->
            <template v-else>
                <div class="flex flex-col items-center py-16">
                    <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                        <UIcon name="ph:receipt-light" class="size-10 text-muted" />
                    </div>

                    <h3 class="mt-4 text-sm font-semibold">No payment found</h3>

                    <p class="mt-1 text-sm text-muted">Payments will appear here once recorded.</p>
                </div>
            </template>
        </div>
    </UCard>
</template>

<script lang="ts" setup>
const store = useStudentStore()
const { format } = useMoney()
const { student } = defineProps<{
    student: string
}>()
const loading = ref(true)

const data = ref<any[]>([])

async function fetchRecord() {
    if (!student) return
    loading.value = true
    data.value = []
    try {
        const res = await store.getPaymentHistoryByStudent(student)
        data.value = res?.records ?? []
    } finally {
        loading.value = false
    }
}

watch(() => student, fetchRecord, { immediate: true })
</script>
