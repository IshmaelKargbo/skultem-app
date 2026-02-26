<template>
    <UCard>
        <div class="space-y-5" v-if="student">
            <div class="flex justify-between items-center border-gray-200">
                <p class="text-lg font-normal">{{ student.givenNames }} {{ student.familyName }}'s Fees</p>
                <div class="space-x-2">
                    <UButton label="Apply Discount" variant="outline" size="sm" icon="mdi:discount-outline" />
                    <UButton label="View Ledger" variant="outline" size="sm" icon="fluent:feed-24-regular" />
                </div>
            </div>
            <div class="grid gap-3 grid-cols-4">
                <UCard class="bg-app-100/50 ring-app-200">
                    <div class="space-y-1">
                        <p class="text-xs text-gray-400">Total Fees</p>
                        <p class="text-xl font-semibold">{{ format(feesState?.total || 0) }}</p>
                    </div>
                </UCard>
                <UCard class="bg-success-100/50 ring-success-300">
                    <div class="space-y-1">
                        <p class="text-xs text-gray-400">Total Paid</p>
                        <p class="text-xl font-semibold">{{ format(feesState?.paid || 0) }}</p>
                    </div>
                </UCard>
                <UCard class="bg-red-100/50 ring-red-300">
                    <div class="space-y-1">
                        <p class="text-xs text-gray-400">Outstanding</p>
                        <p class="text-xl font-semibold">{{ format(feesState?.outstanding || 0) }}</p>
                    </div>
                </UCard>
                <UCard class="bg-purple-100/50 ring-purple-300">
                    <div class="space-y-1">
                        <p class="text-xs text-gray-400">Discounts</p>
                        <p class="text-xl font-semibold">{{ format(feesState?.discount || 0) }}</p>
                    </div>
                </UCard>
            </div>
            <FeeStudentTable :student="student" />
        </div>
        <div v-else>
            <div
                class="border border-dashed flex justify-center flex-col items-center rounded-2xl space-y-5 p-10 h-56 w-full border-blue-300">
                <UIcon class="text-5xl text-gray-300" name="hugeicons:folder-details" />
                <p class="text-gray-300">Select a student to view their fee details</p>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const { student } = defineProps<{
    student: Student | null
}>()

const store = useStudentStore()
const feesState = ref<{
    paid: number,
    outstanding: number,
    total: number,
    discount: number
}>()

async function fetchFees() {
    if (student == null) return

    const res = await store.getAllStudentFeesById(student.id)
    if (res == null) return;

    let outstanding = 0, paid = 0, total = 0, discount = 0;

    (res.records as StudentFee[]).forEach((e: StudentFee) => {
        outstanding += e.outstanding
        paid += e.paid
        total += e.total
        discount += e.discount
    })

    feesState.value = { outstanding, paid, discount, total }
}

watch(() => student, () => fetchFees(), { immediate: true })
const { format } = useMoney()
</script>