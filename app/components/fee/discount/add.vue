<template>
    <u-slideover :dismissible="false" title="Create Discount" :open="open" @update:open="open = $event">

        <!-- Trigger -->
        <UButton color="primary" label="Create Discount" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Create Discount</p>
                <UButton icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
                <!-- Term / Name -->
                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" placeholder="(e.g., 'Discount for Aruna Kargbo - First Term')" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Enter a descriptive name for the discount.
                        </p>
                    </template>
                </UFormField>

                <!-- Assign to Student -->
                <UFormField label="Assign to Student" name="studentId" required>
                    <USelect @change="fetchRecords" :items="students" v-model="state.studentId"
                        placeholder="Select student" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Select a specific student for this discount.
                        </p>
                    </template>
                </UFormField>

                <!-- Fee Category -->
                <UFormField label="Fee Category" name="feeId" required>
                    <USelect @change="changeFee" :items="categories" v-model="state.feeId"
                        placeholder="Select fee category" :disabled="isLoading && !state.studentId" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Select the fee type to apply the discount to (e.g., Tuition, Exam, PTA).
                        </p>
                    </template>
                </UFormField>

                <!-- Type of Discount -->
                <UFormField label="Type" name="kind" required>
                    <USelect @change="kindChange" v-model="state.kind" :items="kindOptions"
                        placeholder="Select Discount Type" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Choose whether the discount is a fixed amount or a percentage of the fee.
                        </p>
                    </template>
                </UFormField>

                <!-- Value -->
                <UFormField label="Value" name="value" required>
                    <UInput @input="handleAmountInput" type="number" v-model="state.value"
                        placeholder="Enter discount value" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter the discount amount or percentage. For percentage, enter a number between 1 and 100.
                        </p>
                    </template>
                </UFormField>

                <div v-if="isRemaning()"
                    class="border border-dashed bg-red-50/50 spacey-1 border-red-300 p-3 rounded-md">
                    <p class="text-xs text-mute">Remaining Balance</p>
                    <p class="text-lg font-semibold">{{ remainingBalance }}</p>
                </div>
                <!-- Expiry Date -->
                <UFormField label="Expiry Date" name="expiryDate" required>
                    <UInput type="date" v-model="state.expiryDate" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            The date by which this discount must be applied. After this date, the discount will no
                            longer be valid.
                        </p>
                    </template>
                </UFormField>
                <!-- Description -->
                <UFormField label="Reason" name="reason" required>
                    <UInput v-model="state.reason" placeholder="Example: reason for the discount."
                        :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter reason for this discount.
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="mynaui:save" :loading="isLoading" label="Save"
                    @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>

    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref, computed, onMounted } from 'vue'
import type { FormSubmitEvent } from '#ui/types'
const { format } = useMoney()
const studentStore = useStudentStore()
const store = useFeeDiscountStore()
const toast = useToast()
const { refreshReport } = defineProps<{
    refreshReport: Function
}>()

const isLoading = ref(false)
const open = ref(false)
const formRef = ref<any>(null)

function isRemaning() {
    if (state.kind && state.value && fee.value) return true
    return false
}

const remainingBalance = computed(() => {
    if (!fee.value) return 0
    let amount = state.value || 0

    if (state.kind == "PERCENTAGE") {
        const rate = (state.value || 0) / 100
        amount = rate * fee.value.outstanding
    }

    return format(Number(fee.value.outstanding) - amount)
})


const kindOptions = [
    { label: 'Percentage', value: 'PERCENTAGE' },
    { label: 'Fixed Amount', value: 'AMOUNT' }
]

function handleAmountInput(event: any) {
    if (!fee.value) return

    if (state.kind == "PERCENTAGE") {
        let value = Number(event.target.value)

        if (isNaN(value)) {
            state.value = null
            return
        }

        if (value > 100) {
            value = 100
        }

        state.value = value

        event.target.value = value
        return
    }

    const max = Number(fee.value.outstanding)
    let value = Number(event.target.value)

    if (isNaN(value)) {
        state.value = null
        return
    }

    if (value > max) {
        value = max
    }

    state.value = value

    event.target.value = value
}

function kindChange() {
    if (state.kind != "PERCENTAGE") return
    let value = state.value || 0

    if (value > 100) {
        state.value = 100
    }
}

const fee = ref<StudentFee>()
const fees = ref<StudentFee[]>([])

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


function changeFee() {
    const selected = fees.value.find(f => f.feeId === state.feeId)
    if (!selected) return

    fee.value = selected
}

const students = computed(() =>
    studentStore.records.map(s => ({
        label: `${s.givenNames} ${s.familyName}`,
        value: s.id
    }))
)

type FeeDiscountForm = {
    studentId: string
    feeId: string
    name: string
    kind: string
    value: number | null
    expiryDate: string
    reason: string
}

const state = reactive<FeeDiscountForm>({
    name: '',
    expiryDate: '',
    value: null,
    feeId: '',
    kind: '',
    reason: '',
    studentId: ''
})

const schema = yup.object({
    studentId: yup.string().required('Student is required'),
    feeId: yup.string().required('Fee is required'),
    kind: yup.string().required('Type is required'),
    value: yup
        .number()
        .typeError('Value must be a number')
        .required('Value is required')
        .positive('Value must be greater than 0')
        .when('kind', {
            is: (val: string) => ['PERCENTAGE'].includes(val),
            then: (schema) =>
                schema
                    .required('Reference number is required for this payment method')
                    .min(1, 'Percentage min is 1')
                    .max(100, "Percentage max is 100"),
            otherwise: (schema) => schema.optional().nullable()
        }),
    expiryDate: yup.string().required('Expiry date is required'),
    reason: yup.string().required("Reason is required")
})

const close = () => {
    open.value = false
    state.expiryDate = ''
    state.feeId = ''
    state.kind = ''
    state.name = ''
    state.value = null
    state.reason = ''
    state.studentId = ''
}

const onSubmit = async (_event: FormSubmitEvent<FeeDiscountForm>) => {
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })

        await store.create({
            expiryDate: state.expiryDate,
            feeId: state.feeId,
            kind: state.kind,
            name: state.name,
            reason: state.reason,
            studentId: state.studentId,
            value: state.value || 0
        })

        await store.fetchAll()
        refreshReport()

        toast.add({
            description: 'Fee discount created successfully',
            color: 'success'
        })

        close()
    } catch (err: any) {
        toast.add({
            description: err.errors?.[0] || err.message,
            color: 'error'
        })
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    studentStore.fetchAll(0, 0)
})
</script>
