<template>
    <UCard :ui="{
        body: 'p-0'
    }">
        <template #header>
            <div class="flex justify-between">
                <p>Payment History</p>
                <p>
                    <UBadge :label="`${data.length} payments`" variant="subtle" color="success" size="sm" />
                </p>
            </div>
        </template>
        <div>
            <div v-for="(row, i) in data" :key="row" class="flex py-2 px-3 justify-between" :class="{
                'border-b border-gray-100': (i + 1) < data.length
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
    if (student == "" || student == null) return
    loading.value = true
    data.value = []
    const res = await store.getPaymentHistoryByStudent(student)
    if (res == null) return

    data.value = res.records
    loading.value = false
}

watch(() => student, () => {
    fetchRecord()
})

onMounted(() => fetchRecord())
</script>