<script setup lang="ts">
import * as yup from 'yup'

const feeStructureStore = useFeeStructureStore()
const feeCategoryStore = useFeeStore()
const termStore = useTermStore()
const materialStore = useMaterialStore()
const clazzStore = useClassStore()

const { error: toastError, success: toastSuccess } = useNotify()

const isLoading = ref(false)

const categories = computed(() =>
    feeCategoryStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const materials = computed(() =>
    materialStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const terms = computed(() =>
    termStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

const classes = computed(() => [
    { label: 'All Classes', value: 'ALL' },
    { label: 'Select Students', value: 'SELECTION' },
    ...clazzStore.records.map((e) => ({
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
    studentIds: string[]
    allowInstallment: boolean
    hasSupply: boolean
    totalSupply: number
    material: string
    description?: string
}

const state = reactive<FeeStructureForm>({
    classId: '',
    termId: '',
    feeCategory: '',
    amount: null,
    dueDate: '',
    studentIds: [],
    allowInstallment: false,
    hasSupply: false,
    totalSupply: 0,
    material: '',
    description: ''
})

const schema = yup.object({
    termId: yup.string().required('Term is required'),

    classId: yup.string().required('Assignment is required'),

    feeCategory: yup.string().required('Fee category is required'),

    amount: yup
        .number()
        .typeError('Amount must be a number')
        .required('Amount is required')
        .positive('Amount must be greater than 0'),

    dueDate: yup.string().required('Due date is required'),

    allowInstallment: yup.boolean(),

    hasSupply: yup.boolean(),

    totalSupply: yup.number().when('hasSupply', {
        is: true,
        then: (schema) =>
            schema
                .required('Total supply is required')
                .min(1, 'Supply must be greater than 0'),
        otherwise: (schema) => schema.default(0)
    }),

    studentIds: yup.array().when('classId', {
        is: 'STUDENT',
        then: (schema) =>
            schema.min(1, 'Select at least one student'),
        otherwise: (schema) => schema
    }),

    description: yup.string().nullable()
})

async function onSubmit() {
    try {
        isLoading.value = true

        await schema.validate(state, {
            abortEarly: false
        })

        const feeType = state.classId == 'ALL' ? 'ALL' :
            state.classId == 'SELECTION' ? 'SELECTION' : 'CLASS'

        await feeStructureStore.create({
            classId:
                state.classId !== 'ALL' &&
                    state.classId !== 'SELECTION'
                    ? state.classId
                    : null,

            studentIds:
                state.classId === 'SELECTION'
                    ? state.studentIds
                    : [],
            type: feeType,
            termId: state.termId,
            feeCategory: state.feeCategory,
            amount: state.amount || 0,
            dueDate: state.dueDate,
            allowInstallment: state.allowInstallment,
            hasSupply: state.hasSupply,
            totalSupply: state.hasSupply
                ? state.totalSupply
                : 0,
            materialId: state.material,
            description: state.description
        })

        await feeStructureStore.fetchAll()

        toastSuccess('Fee structure created successfully')

        navigateTo('/fees-payment/structure')
    } catch (err: any) {
        toastError(
            err?.errors?.[0] ||
            err?.message ||
            'Something went wrong'
        )
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Add Fee Structure')
    document.title = 'Add | Fee Structure | Skultem'
    feeCategoryStore.fetchAll(0, 0)
    termStore.fetchAll(0, 0)
    clazzStore.fetchAll(0, 0)
    materialStore.fetchAll(0, 0)
})

watch(() => state.hasSupply, (value) => {
    if (!value) state.material = ""
}, { immediate: true })

definePageMeta({
    role: [
        Role.ACCOUNTANT,
        Role.PROPRIETOR,
        Role.OWNER
    ]
})
</script>

<template>
    <div class="md:p-5 p-4 py-3 md:py-4 overflow-y-auto h-full space-y-5">

        <Heading title="Fee Structure" subtitle="Create and assign fee structures to students or classes" />

        <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">

            <div class="grid lg:grid-cols-2 gap-4">
                <!-- Fee Details -->
                <UCard>
                    <div class="space-y-2.5">
                        <!-- Term -->
                        <UFormField label="Term" name="termId" required>
                            <USelectMenu v-model="state.termId" value-key="value" :items="terms"
                                placeholder="Select term" :disabled="isLoading" />

                            <template #help>
                                <p class="text-xs text-muted">
                                    Select the academic term this fee applies to.
                                </p>
                            </template>
                        </UFormField>

                        <!-- Category -->
                        <UFormField label="Fee Category" name="feeCategory" required>
                            <USelectMenu v-model="state.feeCategory" value-key="value" :items="categories"
                                placeholder="Select fee category" :disabled="isLoading" />

                            <template #help>
                                <p class="text-xs text-muted">
                                    Example: Tuition, Exam, PTA or Development.
                                </p>
                            </template>
                        </UFormField>

                        <!-- Amount -->
                        <UFormField label="Amount" name="amount" required>
                            <UInput v-model.number="state.amount" type="number" min="0" placeholder="Enter amount"
                                :disabled="isLoading" />

                            <template #help>
                                <p class="text-xs text-muted">
                                    Total amount students are required to pay.
                                </p>
                            </template>
                        </UFormField>

                        <!-- Due Date -->
                        <UFormField label="Due Date" name="dueDate" required>
                            <UInput v-model="state.dueDate" type="date" :disabled="isLoading" />

                            <template #help>
                                <p class="text-xs text-muted">
                                    Deadline for completing payment.
                                </p>
                            </template>
                        </UFormField>

                        <!-- Installment -->
                        <UFormField name="allowInstallment">
                            <div class="flex justify-between items-start py-2">

                                <div>
                                    <p class="font-medium">
                                        Allow Installment
                                    </p>

                                    <p class="text-xs text-muted">
                                        Students can pay in multiple parts.
                                    </p>
                                </div>

                                <USwitch v-model="state.allowInstallment" :disabled="isLoading" />

                            </div>
                        </UFormField>

                        <!-- Has Supply -->
                        <UFormField name="hasSupply">
                            <div class="flex justify-between items-start py-2">

                                <div>
                                    <p class="font-medium">
                                        Has Supply
                                    </p>

                                    <p class="text-xs text-muted">
                                        Supplies will be issued after payment completion.
                                    </p>
                                </div>

                                <USwitch v-model="state.hasSupply" :disabled="isLoading" />

                            </div>
                        </UFormField>

                        <div class="grid grid-cols-2 gap-3">
                            <!-- Material -->
                            <UFormField v-if="state.hasSupply" label="Material" name="material" required>
                                <USelectMenu v-model="state.material" value-key="value" :items="materials"
                                    placeholder="Select material" :disabled="isLoading" />

                                <template #help>
                                    <p class="text-xs text-muted">
                                        Select the type of material or supply item.
                                    </p>
                                </template>
                            </UFormField>

                            <!-- Total Supply -->
                            <UFormField v-if="state.hasSupply" label="Total Supply" name="totalSupply" required>
                                <UInput v-model.number="state.totalSupply" type="number" min="1"
                                    placeholder="Enter quantity" :disabled="isLoading" />

                                <template #help>
                                    <p class="text-xs text-muted">
                                        Number of items each student will receive.
                                    </p>
                                </template>
                            </UFormField>

                        </div>

                        <!-- Description -->
                        <UFormField label="Description" name="description">
                            <UTextarea v-model="state.description" placeholder="Optional description"
                                :disabled="isLoading" />

                            <template #help>
                                <p class="text-xs text-muted">
                                    Additional notes or payment instructions.
                                </p>
                            </template>
                        </UFormField>
                    </div>
                </UCard>

                <!-- Assignment -->
                <div>
                    <UCard class="sticky top-0">
                        <div class="space-y-5">

                            <!-- Assign -->
                            <UFormField label="Assign To" name="classId" required>
                                <USelectMenu v-model="state.classId" value-key="value" :items="classes"
                                    placeholder="Select assignment" :disabled="isLoading" />

                                <template #help>
                                    <p class="text-xs text-muted">
                                        Assign this fee to all students, a class, or selected students.
                                    </p>
                                </template>
                            </UFormField>

                            <!-- Student Selector -->
                            <FeeStructureStudents v-if="state.classId === 'SELECTION'" v-model="state.studentIds" />

                            <!-- Info -->
                            <div v-else
                                class="h-72 border-2 rounded-xl border-gray-200 p-5 flex flex-col text-muted space-y-3 items-center justify-center border-dashed">

                                <UIcon :name="FEE_STRUCTURE_ICON" class="w-12 h-12" />

                                <p v-if="state.classId === 'ALL'" class="text-center">
                                    This fee structure will be assigned to all enrolled students.
                                </p>

                                <p v-else-if="state.classId" class="text-center">
                                    This fee structure will apply to the selected class.
                                </p>

                                <p v-else class="text-center">
                                    Select how you want to assign this fee structure.
                                </p>
                            </div>
                        </div>
                        <template #footer>
                            <div class="flex justify-end gap-3">
                                <UButton label="Cancel" color="neutral" variant="outline" :disabled="isLoading"
                                    @click="navigateTo('/fees/structures')" />

                                <UButton type="submit" icon="lucide:save" label="Create Fee Structure"
                                    :loading="isLoading" />
                            </div>

                        </template>
                    </UCard>
                </div>
            </div>
        </UForm>
    </div>
</template>