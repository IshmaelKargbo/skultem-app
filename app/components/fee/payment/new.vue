<template>
    <UForm :state="state" @submit.prevent="onSubmit" :schema="schema" class="space-y-3">

        <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4">

                <!-- LEFT: FORM -->
                <div>
                    <UCard class="sticky top-0">
                        <div class="space-y-2">

                            <!-- STUDENT -->
                            <UFormField required label="Student" name="studentId">
                                <USelectMenu value-key="value" :items="students" v-model="state.studentId"
                                    @change="onStudentSelect" placeholder="Select Student" />
                            </UFormField>

                            <!-- METHOD -->
                            <UFormField required label="Payment Method" name="method">
                                <USelectMenu value-key="value" v-model="state.method" :items="methodOptions"
                                    placeholder="Payment Method" />
                            </UFormField>

                            <!-- REFERENCE -->
                            <UFormField label="Reference Id">
                                <UInput v-model="state.reference" />
                            </UFormField>

                            <!-- NOTE -->
                            <UFormField label="Note">
                                <UTextarea v-model="state.note" />
                            </UFormField>

                        </div>
                        <template #footer>
                            <div class="flex space-x-3 items-center">
                                <UButton variant="outline" color="neutral" to="/fees-payments">
                                    Cancel
                                </UButton>
                                <UButton :icon="SAVE_ICON" type="submit" :disabled="!canSubmit" :loading="isLoading">
                                    Record Payment
                                </UButton>
                            </div>
                        </template>
                    </UCard>
                </div>
                <div>
                    <UCard>
                        <template #header>
                            <div class="flex justify-between items-center">
                                <p class="font-medium">Fee Allocation</p>
                                <UBadge>{{ allocations.length }}</UBadge>
                            </div>
                        </template>

                        <!-- EMPTY -->
                        <div v-if="!state.studentId" class="items-center space-y-3 justify-center py-10 rounded-xl border-dashed flex flex-col text-sm text-muted  h-56 border-2">
                            <UIcon :name="EMPTY_ICON" class="w-12 h-12" />
                            <p>Select a student to start allocating fees</p>
                        </div>

                        <!-- LOADING -->
                        <div v-else-if="loadingFees" class="text-center py-10 text-sm text-mute">
                            Loading fees...
                        </div>

                        <!-- CONTENT -->
                        <div v-else class="space-y-3">

                            <!-- FEES -->
                            <div v-for="fee in fees" :key="fee.feeId"
                                class="border-2 border-gray-200 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                    <p class="font-medium">{{ fee.feeName }}</p>
                                    <p class="text-xs text-mute">
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
                            <div v-if="allocations.length" class="space-y-3">
                                <div v-for="a in allocations" :key="a.feeId"
                                    class="border-2 border-gray-200 rounded-xl p-3 space-y-2">
                                    <div class="flex justify-between text-sm">
                                        <p class="font-medium">{{ a.feeName }}</p>
                                        <p class="text-mute">
                                            Max {{ format(a.outstanding) }}
                                        </p>
                                    </div>

                                    <!-- AUTO-CAPPED INPUT -->
                                    <UInput type="number" v-model.number="a.amount" min="0" :max="a.outstanding"
                                        @update:modelValue="val => {
                                            a.amount = Number(val)
                                            clampAmount(a)
                                        }" />
                                </div>

                                <UDivider />

                                <!-- TOTALS -->
                                <div class="text-sm space-y-1.5">

                                    <div class="flex justify-between">
                                        <span>Total Allocated</span>
                                        <span :class="{ 'text-red-500': isOverAllocated }">
                                            {{ format(totalAllocated) }}
                                        </span>
                                    </div>

                                    <div class="flex justify-between">
                                        <span>Total Outstanding</span>
                                        <span>{{ format(totalOutstanding) }}</span>
                                    </div>

                                    <div class="flex justify-between font-semibold">
                                        <span>Remaining</span>
                                        <span>{{ format(remaining) }}</span>
                                    </div>

                                    <div v-if="isOverAllocated" class="text-xs text-red-500 font-medium">
                                        ⚠ Allocation exceeds available balance
                                    </div>

                                </div>

                            </div>

                            <div v-else class="text-sm text-mute text-center py-6">
                                Select fees to allocate payment
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

watch(
    allocations,
    () => {
        allocations.value.forEach(clampAmount)
    },
    { deep: true }
)

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
    studentId: yup.string().required(),
    method: yup.string().required(),
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
        useNotify().success("Payment recorded successfully")
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
    { label: 'Bank', value: 'BANK' },
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