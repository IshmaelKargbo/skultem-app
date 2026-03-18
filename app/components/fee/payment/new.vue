<template>
    <UCard>
        <div class="space-y-2">
            <p class="text-base font-medium">Record New Payment</p>

            <UForm :state="state" @submit.prevent="onSubmit" :schema="schema" class="space-y-3">
                <!-- Student -->
                <UFormField required label="Student" name="studentId">
                    <USelectMenu value-key="value" :items="students" @change="fetchRecords" v-model="state.studentId"
                        placeholder="Select Student" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Select the student you are recording this payment for.
                        </p>
                    </template>
                </UFormField>

                <!-- Fee Category -->
                <UFormField required label="Fee" name="category">
                    <USelectMenu value-key="value" :disabled="!state.studentId" v-model="state.category" @change="changeFee"
                        :items="categories" placeholder="Select Fee">
                        <template #item="{ item }: any">
                            <div class="flex justify-between w-full">
                                <span>
                                    {{ item.name }} ({{ format(item.total) }})
                                </span>
                                <span class="text-red-500 font-medium">
                                    - {{ format(item.outstanding) }}
                                </span>
                            </div>
                        </template>
                    </USelectMenu>
                    <template #help>
                        <p class="text-xs text-mute">
                            Choose the type of fee being paid (e.g., Tuition, Development).
                        </p>
                    </template>
                </UFormField>
                <div class="flex space-x-3">
                    <!-- Fee Amount -->
                    <UFormField class="w-full" label="Fee Amount" name="feeAmount">
                        <UInput v-model="state.feeAmount" disabled type="number" placeholder="Total Fee Amount" />
                        <template #help>
                            <p class="text-xs text-mute">
                                This is the total amount expected for this fee.
                            </p>
                        </template>
                    </UFormField>

                    <!-- Amount Paid -->
                    <UFormField class="w-full" label="Amount Paid" required>
                        <UInput @input="handleAmountInput" v-model="state.amountPaid" type="number"
                            placeholder="Amount Paid" />
                        <template #help>
                            <p class="text-xs text-mute">
                                Enter the amount the student is paying now.
                            </p>
                        </template>
                    </UFormField>
                </div>
                <div v-if="isRemaning()"
                    class="border border-dashed bg-red-50/50 spacey-1 border-red-300 p-3 rounded-md">
                    <p class="text-xs text-mute">Remaining Balance</p>
                    <p class="text-lg font-semibold">{{ remainingBalance }}</p>
                </div>
                <!-- Payment Method -->
                <UFormField label="Payment Method" name="method" required>
                    <USelectMenu value-key="value" v-model="state.method" :items="methodOptions" placeholder="Select Payment Method" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Select how the payment was
                            made (Cash, Bank, Mobile Money).
                        </p>
                    </template>
                </UFormField>

                <!-- Reference -->
                <UFormField label="Reference Id" name="reference">
                    <UInput v-model="state.reference" placeholder="Enter reference number" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Required for Bank or Mobile Money payments.
                        </p>
                    </template>
                </UFormField>

                <!-- Note -->
                <UFormField label="Note">
                    <UTextarea v-model="state.note" placeholder="Enter any additional notes" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Optional notes such as partial payment or special arrangement.
                        </p>
                    </template>
                </UFormField>

                <!-- Submit -->
                <UButton type="submit" label="Record Payment" icon="streamline-ultimate:cash-payment-sign-2" size="lg"
                    class="w-full justify-center" :loading="isLoading" />
            </UForm>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as yup from 'yup'
const { format } = useMoney()
const isLoading = ref(false)
const studentStore = useStudentStore()
const store = useFeePaymentStore()
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')
const toast = useToast()

function isRemaning() {
    if (state.feeAmount && state.amountPaid)
        return state.feeAmount - state.amountPaid > 0
    return false
}

type NewRecordPaymentDTO = {
    studentId: string,
    category: string,
    feeAmount: number | null,
    amountPaid: number | null,
    method: string,
    reference: string,
    note: string
}

const state = reactive<NewRecordPaymentDTO>({
    studentId: '',
    category: '',
    feeAmount: null,
    amountPaid: null,
    method: '',
    reference: '',
    note: ''
})

const fee = ref<StudentFee>()
const fees = ref<StudentFee[]>([])

const schema = yup.object({
    studentId: yup.string().required('Student is required'),

    category: yup.string().required('Fee is required'),

    amountPaid: yup
        .number()
        .typeError('Amount must be a number')
        .required('Amount is required')
        .positive('Amount must be greater than 0')
        .test(
            'not-exceed',
            'Amount cannot exceed outstanding balance',
            function (value) {
                if (!value || !fee.value) return false
                return value <= Number(fee.value.outstanding)
            }
        ),

    method: yup.string().required('Payment method is required'),

    reference: yup
        .string()
        .transform((value) => value?.trim())
        .when('method', {
            is: (val: string) => ['BANK', 'MOBILE_MONEY'].includes(val),
            then: (schema) =>
                schema
                    .required('Reference number is required for this payment method')
                    .min(3, 'Reference number is too short'),
            otherwise: (schema) => schema.optional().nullable()
        })
})

const remainingBalance = computed(() => {
    if (!fee.value) return 0
    return format(Number(fee.value.outstanding) - Number(state.amountPaid || 0))
})

const methodOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank', value: 'BANK' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' }
]

function changeFee() {
    const selected = fees.value.find(f => f.feeId === state.category)
    if (!selected) return

    fee.value = selected
    state.feeAmount = Number(selected.total)
}

const categories = ref<{ label: string; value: string, outstanding: string, total: string, name: string }[]>([])

async function fetchRecords() {
    try {
        if (!state.studentId) return
        const result = await useStudentStore().getAllStudentOutstandingFeesById(state.studentId)
        if (result == null) return
        fees.value = result
        categories.value = result.map((s: StudentFee) => ({
            label: `${s.feeName} (${format(s.total)}) - ${format(s.outstanding)}`,
            outstanding: s.outstanding,
            total: s.total,
            name: s.feeName,
            value: s.feeId
        })) || []
    } catch (err) {
        categories.value = []
    }
}

const students = computed(() =>
    studentStore.records.map(s => ({
        label: `${s.givenNames} ${s.familyName} (${s.className})`,
        value: s.id
    }))
)

function handleAmountInput(event: any) {
    if (!fee.value) return

    const max = Number(fee.value.outstanding)
    let value = Number(event.target.value)

    if (isNaN(value)) {
        state.amountPaid = null
        return
    }

    if (value > max) {
        value = max
    }

    state.amountPaid = value

    event.target.value = value
}

const onSubmit = async (_event: FormSubmitEvent<NewRecordPaymentDTO>) => {
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })

        await store.recordPayment({
            studentId: state.studentId,
            feeId: state.category,
            amount: state.amountPaid || 0,
            method: state.method,
            referenceNo: state.reference,
            note: state.note
        })

        await store.fetchAll(1, 3)

        toast.add({
            description: 'Payment rcoarded successfully',
            color: 'success'
        })

        nextTick(() => {
            scrollContainer?.value?.scrollTo({
                top: 0,
                behavior: 'smooth',
            })
        })
        reset()
    } catch (err: any) {
        toast.add({
            description: err.errors?.[0] || err.message,
            color: 'error'
        })
    } finally {
        isLoading.value = false
    }
}

function reset() {
    state.amountPaid = null
    state.category = ""
    state.feeAmount = null
    state.studentId = ""
    state.method = ""
    state.reference = ""
}

onMounted(() => {
    studentStore.fetchAll(0, 0)
})
</script>