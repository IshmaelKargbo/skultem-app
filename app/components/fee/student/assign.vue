<template>
    <u-slideover :dismissible="false" title="Assign Fee to Student" :open="open" @update:open="open = $event">

        <!-- Trigger -->
        <UButton
            :disabled="!student"
            label="Assign Fee"
            variant="outline"
            size="sm"
            icon="mdi:cash-plus"
            @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <div>
                    <p class="text-lg font-semibold">Assign Fee to Student</p>
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
                Select a student to assign a fee.
            </div>
            <UForm v-else ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
                <UFormField label="Fee Structure" name="feeId" required>
                    <USelect :items="structures" v-model="state.feeId" placeholder="Select fee"
                        :disabled="isLoading || structures.length === 0" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Choose a fee structure to assign to this student.
                        </p>
                    </template>
                </UFormField>

                <div v-if="selectedStructure" class="border border-dashed rounded-lg p-3 space-y-1">
                    <p class="text-xs text-muted">Preview</p>
                    <p class="text-sm font-medium">{{ selectedStructure.category.name }} - {{
                        selectedStructure.term.name }}</p>
                    <p class="text-xs text-muted">
                        {{ selectedStructure.clazz?.name || 'All Classes' }} • {{
                        format(selectedStructure.amount) }}
                    </p>
                </div>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="lucide:save" :loading="isLoading" label="Assign" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>

    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
    student: Student | null
}>()

const emit = defineEmits<{
    (e: 'assigned'): void
}>()

const store = useFeeStructureStore()
const toast = useToast()
const { format } = useMoney()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref<any>(null)

const structures = computed(() =>
    store.records.map((item) => ({
        label: `${item.category.name} - ${item.term.name} (${format(item.amount)})`,
        value: item.id
    }))
)

const selectedStructure = computed(() =>
    store.records.find((item) => item.id === state.feeId)
)

type AssignFeeForm = {
    feeId: string
}

const state = reactive<AssignFeeForm>({
    feeId: ''
})

const schema = yup.object({
    feeId: yup.string().required('Fee is required')
})

const close = () => {
    open.value = false
    state.feeId = ''
}

const loadStructures = async () => {
    if (store.records.length > 0) return
    await store.fetchAll(1, 200)
}

const onSubmit = async (_event: FormSubmitEvent<AssignFeeForm>) => {
    if (!props.student) return

    isLoading.value = true
    try {
        await schema.validate(state, { abortEarly: false })

        await store.assignToStudent({
            studentId: props.student.id,
            feeId: state.feeId
        })

        toast.add({
            description: 'Fee assigned successfully',
            color: 'success'
        })

        emit('assigned')
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

watch(
    () => open.value,
    async (isOpen) => {
        if (isOpen) {
            await loadStructures()
        }
    }
)
</script>
