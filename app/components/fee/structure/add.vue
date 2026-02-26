<template>
    <u-slideover :dismissible="false" title="Add Fee Structure" :open="open" @update:open="open = $event">

        <!-- Trigger -->
        <UButton variant="subtle" color="primary" label="Add Fee Structure" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Fee Structure</p>
                <UButton icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">

                <!-- Term -->
                <UFormField label="Term" name="termId" required>
                    <USelect :items="terms" v-model="state.termId" placeholder="Select term" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Select the academic term this fee structure applies to.
                        </p>
                    </template>
                </UFormField>

                <!-- Class -->
                <UFormField label="Class" name="classId" required>
                    <USelect :items="classes" v-model="state.classId" placeholder="Select class"
                        :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Choose a specific class or apply this fee to all classes.
                        </p>
                    </template>
                </UFormField>

                <!-- Fee Category -->
                <UFormField label="Fee Category" name="feeCategory" required>
                    <USelect :items="categories" v-model="state.feeCategory" placeholder="Select fee category"
                        :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Select the type of fee (e.g., Tuition, Exam, Development, PTA).
                        </p>
                    </template>
                </UFormField>

                <!-- Amount -->
                <UFormField label="Amount" name="amount" required>
                    <UInput type="number" v-model="state.amount" placeholder="Enter fee amount" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter the total amount students are required to pay.
                        </p>
                    </template>
                </UFormField>

                <!-- Due Date -->
                <UFormField label="Due Date" name="dueDate" required>
                    <UInput type="date" v-model="state.dueDate" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            This is the deadline students must complete payment.
                        </p>
                    </template>
                </UFormField>

                <!-- Allow Installment -->
                <UFormField name="allowInstallment">
                    <div class="flex justify-between w-full py-2.5">
                        <div>
                            <p class="font-medium">Allow Installment</p>
                            <p class="text-xs text-muted">
                                Enable this if students can pay the fee in multiple parts.
                            </p>
                        </div>
                        <USwitch v-model="state.allowInstallment" :disabled="isLoading" />
                    </div>
                </UFormField>

                <!-- Description -->
                <UFormField label="Description" name="description">
                    <UTextarea v-model="state.description" placeholder="Optional description" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Add additional notes or payment instructions (optional).
                        </p>
                    </template>
                </UFormField>

            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="mynaui:save" :loading="isLoading" label="Save" variant="subtle"
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

const feeStructureStore = useFeeStructureStore()
const feeCategoryStore = useFeeStore()
const termStore = useTermStore()
const clazzStore = useClassStore()
const toast = useToast()

const isLoading = ref(false)
const open = ref(false)
const formRef = ref<any>(null)

const categories = computed(() =>
    feeCategoryStore.records.map(e => ({
        label: e.name,
        value: e.id
    }))
)

const terms = computed(() =>
    termStore.records.map(e => ({
        label: e.name,
        value: e.id
    }))
)

const classes = computed(() => [
    { label: 'All Classes', value: 'ALL' },
    ...clazzStore.records.map(e => ({
        label: e.name,
        value: e.id
    }))
])

type FeeStructureForm = {
    classId: string
    termId: string
    feeCategory: string
    amount: number | null
    dueDate: string
    allowInstallment: boolean
    description?: string
}

const state = reactive<FeeStructureForm>({
    classId: '',
    termId: '',
    feeCategory: '',
    amount: null,
    dueDate: '',
    allowInstallment: false,
    description: ''
})

const schema = yup.object({
    termId: yup.string().required('Term is required'),
    classId: yup.string().required('Class is required'),
    feeCategory: yup.string().required('Fee category is required'),
    amount: yup
        .number()
        .typeError('Amount must be a number')
        .required('Amount is required')
        .positive('Amount must be greater than 0'),
    dueDate: yup.string().required('Due date is required'),
    allowInstallment: yup.boolean(),
    description: yup.string().nullable()
})

const close = () => {
    open.value = false
    state.classId = ''
    state.termId = ''
    state.feeCategory = ''
    state.amount = null
    state.dueDate = ''
    state.allowInstallment = false
    state.description = ''
}

const onSubmit = async (_event: FormSubmitEvent<FeeStructureForm>) => {
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })

        await feeStructureStore.create({
            classId: state.classId != 'ALL' ? state.classId : null,
            termId: state.termId,
            feeCategory: state.feeCategory,
            amount: state.amount || 0,
            dueDate: state.dueDate,
            allowInstallment: state.allowInstallment,
            description: state.description
        })

        await feeStructureStore.fetchAll()

        toast.add({
            description: 'Fee structure created successfully',
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
    feeCategoryStore.fetchAll(0, 0)
    termStore.fetchAll(0, 0)
    clazzStore.fetchAll(0, 0)
})
</script>