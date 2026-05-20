<template>
    <div class="space-y-5">
        <UCard :ui="{
            body: 'sm:p-0'
        }">
            <template v-if="student" #header>
                <div class="space-y-4">
                    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div class="flex items-center gap-3">
                            <UAvatar size="lg" :src="student.photo || '/avatar-placeholder.svg'"
                                :alt="`${student.givenNames} ${student.familyName}`"
                                class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0" />
                            <div>
                                <p class="text-lg font-semibold">{{ student.givenNames }} {{ student.familyName }}'s
                                    Fees
                                </p>
                                <p class="text-xs text-muted mt-0.5">Live summary of assigned fees, payments, and
                                    discounts.
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <FeeStudentAssign v-if="can([Role.ACCOUNTANT])" :student="student"
                                @assigned="refreshFees" />
                            <FeeDiscountAdd v-if="can([Role.ACCOUNTANT])" :student-id="student.id"
                                :refresh-report="refreshFees" trigger-label="Apply Discount" trigger-variant="outline"
                                trigger-size="sm" trigger-icon="mdi:discount-outline" trigger-color="neutral" />
                        </div>
                    </div>
                </div>
            </template>
            <div v-if="student">
                <div class="p-5 border-b border-gray-200 dark:border-gray-800 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <UCard class="bg-app-100/60 dark:bg-app-900/30 ring-app-300/70 dark:ring-app-800/70">
                        <div class="space-y-1">
                            <p class="text-xs text-gray-500 dark:text-gray-400">Total Fees</p>
                            <p class="text-xl font-semibold">{{ format(feesState?.total || 0) }}</p>
                        </div>
                    </UCard>
                    <UCard
                        class="bg-success-100/60 dark:bg-success-900/25 ring-success-300/80 dark:ring-success-800/70">
                        <div class="space-y-1">
                            <p class="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
                            <p class="text-xl font-semibold">{{ format(feesState?.paid || 0) }}</p>
                        </div>
                    </UCard>
                    <UCard class="bg-red-100/60 dark:bg-red-900/25 ring-red-300/80 dark:ring-red-800/70">
                        <div class="space-y-1">
                            <p class="text-xs text-gray-500 dark:text-gray-400">Outstanding</p>
                            <p class="text-xl font-semibold">{{ format(feesState?.outstanding || 0) }}</p>
                        </div>
                    </UCard>
                    <UCard class="bg-purple-100/60 dark:bg-purple-900/25 ring-purple-300/80 dark:ring-purple-800/70">
                        <div class="space-y-1">
                            <p class="text-xs text-gray-500 dark:text-gray-400">Discounts</p>
                            <p class="text-xl font-semibold">{{ format(feesState?.discount || 0) }}</p>
                        </div>
                    </UCard>
                </div>
                <FeeStudentTable :student="student" :refresh-key="refreshKey" />
            </div>
            <div v-else
                class="border border-dashed flex justify-center flex-col items-center rounded-2xl space-y-5 p-10 h-56 w-full border-blue-300 dark:border-gray-700">
                <UIcon class="text-5xl text-gray-300 dark:text-gray-500" name="hugeicons:folder-details" />
                <p class="text-gray-500 dark:text-gray-400">Select a student to view their fee details</p>
            </div>
        </UCard>
        <FeeStudentPayments :student="student" />
    </div>
</template>

<script setup lang="ts">
const { student } = defineProps<{
    student: Student | undefined
}>()
const { can } = useAuth()
const store = useStudentStore()
const feesState = ref<{
    paid: number,
    outstanding: number,
    total: number,
    discount: number
}>()
const refreshKey = ref(0)

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

function refreshFees() {
    refreshKey.value += 1
    fetchFees()
}

watch(() => student, () => fetchFees(), { immediate: true })
const { format } = useMoney()
</script>
