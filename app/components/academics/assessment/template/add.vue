<template>
    <u-slideover :dismissible="false" title="Add Assessment Template" :open="open" @update:open="open = $event">

        <!-- Trigger -->
        <UButton color="primary" label="Add Assessment Template" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Assessment Template</p>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
                <!-- Name -->
                <UFormField required label="Template Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. SSS Standard 3-Part Template"
                        :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter a clear name for this assessment structure (e.g. “Primary Standard”, “SSS Final
                            Structure”).
                        </p>
                    </template>
                </UFormField>
                <UFormField required label="Template Pass Mark" name="passMark">
                    <UInput v-model.number="state.passMark" type="number" min="0" max="100"
                        placeholder="Enter pass mark" :disabled="isLoading" />

                    <template #help>
                        <p class="text-xs text-muted">
                            Set the minimum score required for students to pass this assessment template.
                        </p>
                    </template>
                </UFormField>

                <!-- Description -->
                <UFormField required label="Template Description" name="description">
                    <UTextarea v-model="state.description"
                        placeholder="Briefly describe how this assessment is structured" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Describe how the assessments are distributed (e.g. 20% Test 1, 20% Test 2, 60% Exam).
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="lucide:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>

    </u-slideover>
</template>
<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useAssessmentStore()
const { error: toastError, success: toastSuccess } = useNotify()

const isLoading = ref(false)
const open = ref(false)
const formRef = ref<any>(null)

type AssessmentTemplateForm = {
    name: string
    passMark: number
    description: string
}

const state = reactive<AssessmentTemplateForm>({
    name: '',
    passMark: 50,
    description: ''
})

const schema = yup.object({
    name: yup.string().required('Template name is required'),

    passMark: yup
        .number()
        .required('Pass mark is required')
        .min(0, 'Pass mark cannot be less than 0')
        .max(100, 'Pass mark cannot be greater than 100'),

    description: yup
        .string()
        .required('Template description is required')
})

const close = () => {
    open.value = false
    state.name = ''
    state.passMark = 50
    state.description = ''
}

const onSubmit = async (event: FormSubmitEvent<AssessmentTemplateForm>) => {
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })

        await store.create({
            name: state.name,
            passMark: state.passMark,
            description: state.description
        })

        await store.fetchAll()

        toastSuccess('Assessment template created successfully')

        close()
    } catch (err: any) {
        toastError(err.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}
</script>
