<template>
    <u-slideover title="Add Term" :open="open" @update:open="open = $event">
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
                <UFormField required label="Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. 2023/2024" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the academic year in the format YYYY/YYYY</p>
                    </template>
                </UFormField>
                <UFormField required label="Academic Year" name="academicYearId">
                    <USelect :items="academicYears" v-model="state.academicYearId" :disabled="isLoading" placeholder="Select academic year" />
                    <template #hint>
                        <p class="text-xs text-muted">Select the academic year this term belongs to.</p>
                    </template>
                </UFormField>
                <UFormField required label="Start Date" name="startDate" class="flex-1">
                    <UInput v-model="state.startDate" type="date" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">The first day of the academic year.</p>
                    </template>
                </UFormField>

                <UFormField required label="End Date" name="endDate" class="flex-1">
                    <UInput v-model="state.endDate" type="date" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">The last day of the academic year.</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button icon="mynaui:save" :loading="isLoading" label="Save"
                    @click="formRef?.submit()" />
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
    academicYearId: string
}

const academicYears = computed(() => academicYearStore.list)

// reactive form state
const state = reactive<TermForm>({
    name: '',
    startDate: '',
    endDate: '',
    academicYearId: ''
})

// reactive error state
const errors = reactive<Record<string, string>>({
    name: '',
    startDate: '',
    endDate: '',
    academicYearId: ''
})

// yup validation schema
const schema = yup.object({
    name: yup.string().required('Name is required'),
    startDate: yup.string().required('Start date is required'),
    endDate: yup.string().required('End date is required'),
    academicYearId: yup.string().required('Academic year is required')
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.name = ''
    state.startDate = ''
    state.endDate = ''
    state.academicYearId = ''
    Object.keys(errors).forEach(key => (errors[key] = ''))
}

const onSubmit = async (event: FormSubmitEvent<TermForm>) => {
    event.preventDefault()
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })
        await store.create({
            name: state.name,
            startDate: state.startDate,
            endDate: state.endDate,
            academicYearId: state.academicYearId
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
</script>
