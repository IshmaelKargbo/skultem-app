<template>
    <UCard :ui="{
        body: 'p-0'
    }">
        <template #header>
            <div class="flex justify-between">
                <p>Payment History</p>
                <p v-if="!loading && data.length">
                    <UBadge :label="`${data.length} payments`" variant="subtle" color="success" size="sm" />
                </p>
            </div>
        </template>
        <div>
            <!-- Loading -->
            <template v-if="loading">
                <div v-for="i in 4" :key="i" class="flex py-2 px-3 justify-between" :class="{
                    'border-b border-gray-100 dark:border-gray-800': i < 4
                }">
                    <div class="flex space-x-2.5 items-center">
                        <USkeleton class="size-9 shrink-0 rounded-md" />
                        <div class="space-y-1.5">
                            <USkeleton class="h-3.5 w-28 rounded-md" />
                            <USkeleton class="h-2.5 w-20 rounded-md" />
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-1.5">
                        <USkeleton class="h-3.5 w-16 rounded-md" />
                        <USkeleton class="h-4 w-16 rounded-full" />
                    </div>
                </div>
            </template>

            <!-- Data -->
            <template v-else-if="data.length">
                <div v-for="(row, i) in data" :key="row.id ?? i" class="flex py-2 px-3 justify-between" :class="{
                    'border-b border-gray-100 dark:border-gray-800': (i + 1) < data.length
                }">
                    <div class="flex space-x-2.5 items-center">
                        <div class="bg-success-100 p-2.5 rounded-md flex items-center">
                            <UIcon :name="CHECK_ICON" />
                        </div>
                        <div class="space-y-0.5">
                            <p class="text-sm">{{ row.fee }}</p>
                            <p class="text-[11px] text-mute">{{ formatDateString(row.createdAt) }}</p>
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-0.5">
                        <p class="text-success text-sm font-medium">{{ format(row.amount) }}</p>
                        <div class="flex space-x-2">
                            <UBadge size="sm" :label="parsePaymentMethod[row.paymentMethod]" variant="outline"
                                color="neutral" />
                        </div>
                    </div>
                </div>
            </template>

            <!-- Empty -->
            <template v-else>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="ph:receipt-light" class="text-4xl text-gray-400" />
                    <p class="text-gray-500">No payment found.</p>
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
