<template>
    <u-slideover :dismissible="false" title="Payment History" :open="open" @update:open="open = $event">

        <!-- Trigger -->
        <UButton
            :disabled="!student"
            label="Payment History"
            variant="outline"
            size="sm"
            icon="fluent:payment-24-regular"
            @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <div>
                    <p class="text-lg font-semibold">Payment History</p>
                    <p v-if="student" class="text-xs text-muted">
                        {{ student.givenNames }} {{ student.familyName }}
                    </p>
                </div>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <div v-if="!student" class="border border-dashed rounded-lg p-4 text-sm text-muted">
                Select a student to view payment history.
            </div>
            <div v-else class="space-y-4">
                <UInput v-model="search" placeholder="Search payments" :disabled="isLoading" />

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
                    class="text-mute border border-dashed border-gray-100 flex h-40 w-full justify-center items-center">
                    No payments found
                </div>

                <div v-else class="space-y-3">
                    <UCard v-for="item in filtered" :key="item.id">
                        <div class="space-y-2">
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="text-sm font-medium">{{ item.fee }}</p>
                                    <p class="text-xs text-mute">{{ item.term }}</p>
                                </div>
                                <p class="text-sm font-semibold text-success">{{ format(item.amount) }}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-xs text-mute">
                                <div>
                                    <p>Method</p>
                                    <p class="text-gray-700">{{ parsePaymentMethod[item.paymentMethod] }}</p>
                                </div>
                                <div>
                                    <p>Date</p>
                                    <p class="text-gray-700">{{ formatDate(item.paidAt) }}</p>
                                </div>
                            </div>
                            <div v-if="item.referenceNo" class="text-xs text-mute">
                                Reference: <span class="text-gray-700">{{ item.referenceNo }}</span>
                            </div>
                            <div v-if="item.note" class="text-xs text-mute">
                                Note: <span class="text-gray-700">{{ item.note }}</span>
                            </div>
                        </div>
                    </UCard>
                </div>

                <UPagination
                    v-if="meta && !isLoading"
                    size="sm"
                    v-model:page="page"
                    :page-size="meta.size"
                    :items-per-page="meta.size"
                    :total="meta.total"
                    show-edges />
            </div>
        </template>

    </u-slideover>
</template>

<script setup lang="ts">
const props = defineProps<{
    student: Student | null
}>()

const store = useStudentStore()
const { format } = useMoney()
const search = ref('')
const open = ref(false)
const isLoading = ref(false)

const records = ref<FeePayment[]>([])
const meta = ref<Meta>()
const page = ref(1)
const size = ref(6)

const filtered = computed(() => {
    if (!search.value) return records.value
    const term = search.value.toLowerCase()
    return records.value.filter((item) =>
        item.term.includes(term) ||
        item.term.toLowerCase().includes(term) ||
        item.referenceNo?.toLowerCase().includes(term)
    )
})

const close = () => {
    open.value = false
    search.value = ''
}

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
    () => [props.student?.id, page.value, open.value],
    async ([studentId, currentPage, isOpen]) => {
        if (!studentId || !isOpen) return
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
