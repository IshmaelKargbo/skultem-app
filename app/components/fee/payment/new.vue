<template>
    <UForm :state="state" @submit.prevent="onSubmit" :schema="schema" class="space-y-3">
        <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4">

                <!-- LEFT: Payment Details -->
                <div>
                    <UCard class="sticky top-0">
                        <div class="space-y-3">

                            <!-- STUDENT -->
                            <UFormField required label="Student" name="studentId">
                                <USelectMenu
                                    value-key="value"
                                    :items="students"
                                    v-model="state.studentId"
                                    @change="onStudentSelect"
                                    placeholder="Select student"
                                />
                                <template #help>
                                    Select the student you are recording this payment for.
                                </template>
                            </UFormField>

                            <!-- METHOD -->
                            <UFormField required label="Payment Method" name="method">
                                <USelectMenu
                                    value-key="value"
                                    v-model="state.method"
                                    :items="methodOptions"
                                    placeholder="Select payment method"
                                />
                                <template #help>
                                    Select how the payment was made — cash, bank transfer, or mobile money.
                                </template>
                            </UFormField>

                            <!-- REFERENCE -->
                            <UFormField label="Reference ID" name="reference">
                                <UInput v-model="state.reference" placeholder="e.g. TXN-00123" />
                                <template #help>
                                    Optional. Enter a transaction or receipt number for tracking purposes.
                                </template>
                            </UFormField>

                            <!-- NOTE -->
                            <UFormField label="Note" name="note">
                                <UTextarea v-model="state.note" placeholder="Any additional payment notes…" />
                                <template #help>
                                    Optional. Add any remarks about this payment.
                                </template>
                            </UFormField>

                        </div>

                        <template #footer>
                            <div class="flex space-x-3 items-center">
                                <UButton variant="outline" color="neutral" to="/fees-payment/pay">
                                    Cancel
                                </UButton>
                                <UButton :icon="SAVE_ICON" type="submit" :disabled="!canSubmit" :loading="isLoading">
                                    Record Payment
                                </UButton>
                            </div>
                        </template>
                    </UCard>
                </div>

                <!-- RIGHT: Fee Allocation -->
                <div>
                    <UCard>
                        <template #header>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="font-medium">Fee Allocation</p>
                                    <p class="text-sm text-muted">
                                        Select which fees this payment covers and enter the amount for each.
                                    </p>
                                </div>
                                <UBadge>{{ allocations.length }}</UBadge>
                            </div>
                        </template>

                        <!-- EMPTY: no student selected -->
                        <div
                            v-if="!state.studentId"
                            class="items-center space-y-3 justify-center h-110 py-10 rounded-xl border-dashed flex flex-col text-sm text-muted border-2"
                        >
                            <UIcon :name="EMPTY_ICON" class="w-12 h-12" />
                            <p>Select a student to view their outstanding fees</p>
                        </div>

                        <!-- LOADING -->
                        <div v-else-if="loadingFees" class="text-center py-10 text-sm text-muted">
                            <div class="flex items-center justify-center gap-2">
                                <UIcon name="i-lucide-loader-circle" class="animate-spin" />
                                Loading outstanding fees…
                            </div>
                        </div>

                        <!-- NO FEES -->
                        <div
                            v-else-if="!fees.length"
                            class="items-center space-y-3 justify-center py-10 rounded-xl border-dashed flex flex-col text-sm text-muted h-56 border-2"
                        >
                            <UIcon name="i-lucide-circle-check-big" class="w-12 h-12 text-green-500" />
                            <p>This student has no outstanding fees</p>
                        </div>

                        <!-- CONTENT -->
                        <div v-else class="space-y-3">

                            <!-- AVAILABLE FEES -->
                            <p class="text-xs text-muted uppercase font-medium tracking-wide">
                                Outstanding Fees
                            </p>

                            <div
                                v-for="fee in fees"
                                :key="fee.feeId"
                                class="border-2 border-gray-200 rounded-xl p-3 flex justify-between items-center"
                            >
                                <div>
                                    <p class="font-medium">{{ fee.feeName }}</p>
                                    <p class="text-xs text-muted">
                                        Outstanding: {{ format(fee.outstanding) }}
                                    </p>
                                </div>

                                <UButton size="xs" v-if="!isSelected(fee.feeId)" @click="addFee(fee)">
                                    Add
                                </UButton>
                                <UButton size="xs" v-else color="error" variant="ghost" @click="removeFee(fee.feeId)">
                                    Remove
                                </UButton>
                            </div>

                            <UDivider />

                            <!-- ALLOCATIONS -->
                            <template v-if="allocations.length">
                                <p class="text-xs text-muted uppercase font-medium tracking-wide">
                                    Payment Allocations
                                </p>

                                <div
                                    v-for="a in allocations"
                                    :key="a.feeId"
                                    class="border-2 border-gray-200 rounded-xl p-3 space-y-2"
                                >
                                    <div class="flex justify-between text-sm">
                                        <p class="font-medium">{{ a.feeName }}</p>
                                        <p class="text-muted">Max {{ format(a.outstanding) }}</p>
                                    </div>

                                    <UInput
                                        type="number"
                                        v-model.number="a.amount"
                                        min="0"
                                        :max="a.outstanding"
                                        :placeholder="`0 – ${format(a.outstanding)}`"
                                        @update:modelValue="val => {
                                            a.amount = Number(val)
                                            clampAmount(a)
                                        }"
                                    />

                                    <p class="text-xs text-muted">
                                        Enter the amount being paid toward this fee. Cannot exceed the outstanding balance.
                                    </p>
                                </div>

                                <UDivider />

                                <!-- TOTALS -->
                                <div class="text-sm space-y-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
                                    <div class="flex justify-between">
                                        <span class="text-muted">Total Allocated</span>
                                        <span :class="{ 'text-red-500 font-medium': isOverAllocated }">
                                            {{ format(totalAllocated) }}
                                        </span>
                                    </div>

                                    <div class="flex justify-between">
                                        <span class="text-muted">Total Outstanding</span>
                                        <span>{{ format(totalOutstanding) }}</span>
                                    </div>

                                    <UDivider />

                                    <div class="flex justify-between font-semibold">
                                        <span>Remaining Balance</span>
                                        <span>{{ format(remaining) }}</span>
                                    </div>
                                </div>

                                <div
                                    v-if="isOverAllocated"
                                    class="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3"
                                >
                                    <UIcon name="i-lucide-triangle-alert" class="shrink-0 mt-0.5" />
                                    One or more allocations exceed the outstanding balance. Please correct the amounts before submitting.
                                </div>

                                <div
                                    v-else-if="totalAllocated === 0"
                                    class="text-xs text-muted text-center"
                                >
                                    Enter an amount for at least one fee to proceed.
                                </div>

                            </template>

                            <div v-else class="text-sm text-muted text-center py-6">
                                Add fees above to allocate this payment across them.
                            </div>

                        </div>
                    </UCard>
                </div>
            </div>
        </div>
    </UForm>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const emit = defineEmits(['complete'])

const state = reactive({
    studentId: '',
    method: '',
    reference: '',
    note: '',
})

const fees = ref<any[]>([])
const allocations = ref<any[]>([])
const loadingFees = ref(false)
const isLoading = ref(false)

async function onStudentSelect() {
    allocations.value = []
    fees.value = []
    loadingFees.value = true

    try {
        const result = await useStudentStore()
            .getAllStudentOutstandingFeesById(state.studentId)

        fees.value = result || []
    } finally {
        loadingFees.value = false
    }
}

function addFee(fee: any) {
    if (isSelected(fee.feeId)) return

    allocations.value.push({
        feeId: fee.feeId,
        feeName: fee.feeName,
        outstanding: Number(fee.outstanding),
        amount: 0,
    })
}

function removeFee(id: string) {
    allocations.value = allocations.value.filter(a => a.feeId !== id)
}

function isSelected(id: string) {
    return allocations.value.some(a => a.feeId === id)
}

function clampAmount(a: any) {
    const max = Number(a.outstanding)
    let v = Number(a.amount)

    if (isNaN(v) || v < 0) v = 0
    if (v > max) v = max

    a.amount = v
}

watch(allocations, () => {
    allocations.value.forEach(clampAmount)
}, { deep: true })

const totalAllocated = computed(() =>
    allocations.value.reduce((s, a) => s + Number(a.amount || 0), 0)
)

const totalOutstanding = computed(() =>
    fees.value.reduce((s, f) => s + Number(f.outstanding || 0), 0)
)

const remaining = computed(() =>
    Math.max(0, totalOutstanding.value - totalAllocated.value)
)

const isOverAllocated = computed(() =>
    totalAllocated.value > totalOutstanding.value
)

const schema = yup.object({
    studentId: yup.string().required('Please select a student'),
    method: yup.string().required('Please select a payment method'),
})

const canSubmit = computed(() =>
    state.studentId &&
    state.method &&
    allocations.value.length > 0 &&
    totalAllocated.value > 0 &&
    !isOverAllocated.value
)

async function onSubmit() {
    isLoading.value = true

    try {
        await useFeePaymentStore().recordPayment({
            studentId: state.studentId,
            method: state.method,
            referenceNo: state.reference,
            note: state.note,
            allocations: allocations.value.map(a => ({
                feeId: a.feeId,
                amount: a.amount
            }))
        })

        emit('complete')
        reset()
        useNotify().success('Payment recorded successfully')
    } catch (error: any) {
        useNotify().error(error.errors?.[0] || error.message)
    } finally {
        isLoading.value = false
    }
}

function reset() {
    state.studentId = ''
    state.method = ''
    state.reference = ''
    state.note = ''
    fees.value = []
    allocations.value = []
}

function format(v: number) {
    return new Intl.NumberFormat().format(v || 0)
}

const methodOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Transfer', value: 'BANK' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' }
]

const studentStore = useStudentStore()

const students = computed(() =>
    studentStore.records.map(s => ({
        label: `${s.givenNames} ${s.familyName}`,
        value: s.id
    }))
)

onMounted(() => {
    studentStore.fetchAll(0, 0)
})
</script>