<template>
    <u-slideover :dismissible="false" title="Add Term" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton color="primary" label="Add Term" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Term</p>
                <u-button icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <div class="rounded-md border border-primary-200 bg-primary-50 p-3">
                    <p class="text-sm font-medium text-primary-800">Active Academic Year</p>
                    <p v-if="activeAcademicYear" class="text-xs text-primary-700 mt-1">
                        {{ activeAcademicYear.name }}: {{ formatDate(activeAcademicYear.startDate) }} - {{
                            formatDate(activeAcademicYear.endDate) }}
                    </p>
                    <p v-else class="text-xs text-amber-700 mt-1">
                        No active academic year found. Activate one before creating terms.
                    </p>
                </div>

                <!-- Name -->
                <UFormField required label="Term Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Term 1"
                        :disabled="isLoading || !activeAcademicYear" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Enter the official name of the term (e.g. Term 1, Term 2, Term 3).
                        </p>
                    </template>
                </UFormField>

                <!-- Start Date -->
                <UFormField required label="Start Date" name="startDate">
                    <UInput v-model="state.startDate" type="date" :min="activeAcademicYear?.startDate"
                        :max="activeAcademicYear?.endDate" :disabled="isLoading || !activeAcademicYear" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Must be within the active academic year range.
                        </p>
                    </template>
                </UFormField>

                <!-- End Date -->
                <UFormField required label="End Date" name="endDate">
                    <UInput v-model="state.endDate" type="date" :min="activeAcademicYear?.startDate"
                        :max="activeAcademicYear?.endDate" :disabled="isLoading || !activeAcademicYear" />
                    <template #help>
                        <p class="text-xs text-mute">
                            Must be within the active academic year range.
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button icon="mynaui:save" :loading="isLoading" label="Save" @click="formRef?.submit()"
                    :disabled="!activeAcademicYear" />
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useTermStore()
const academicYearStore = useAcademicYearStore()
const toast = useToast()
const isLoading = ref(false)

type TermForm = {
    name: string
    startDate: string
    endDate: string
}

const activeAcademicYear = computed(() =>
    academicYearStore.records.find((year) => year.active || year.status === 'ACTIVE')
)

// reactive form state
const state = reactive<TermForm>({
    name: '',
    startDate: '',
    endDate: ''
})

// reactive error state
const errors = reactive<Record<string, string>>({
    name: '',
    startDate: '',
    endDate: ''
})

// yup validation schema
const schema = yup.object({
    name: yup.string().required('Name is required'),
    startDate: yup.string().required('Start date is required'),
    endDate: yup.string().required('End date is required')
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.name = ''
    state.startDate = ''
    state.endDate = ''
    Object.keys(errors).forEach(key => (errors[key] = ''))
}

const onSubmit = async (event: FormSubmitEvent<TermForm>) => {
    event.preventDefault()

    if (!activeAcademicYear.value) {
        toast.add({ description: 'Activate an academic year before creating terms', color: 'warning' })
        return
    }

    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })
        await store.create({
            name: state.name,
            startDate: state.startDate,
            endDate: state.endDate
        })

        await store.fetchAll()
        toast.add({ description: 'Term created successfully', color: 'success' })
        close()
    } catch (err: any) {
        toast.add({ description: err.message, color: 'error' })
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    academicYearStore.fetchAll()
})

const formatDate = (value: string) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString()
}
</script>
