<template>
    <u-slideover title="Add Subject" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton color="primary" label="Add Subject" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Subject</p>
                <u-button icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <UFormField required label="Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Mathematics" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the name of the subject (e.g. Mathematics).</p>
                    </template>
                </UFormField>
                <UFormField required label="Code" name="code">
                    <UInput v-model="state.code" placeholder="e.g. MATH101" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the code for this subject (e.g. MATH101).</p>
                    </template>
                </UFormField>
                <UFormField required label="Description" name="description">
                    <UTextarea v-model="state.description" placeholder="Enter description" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the description of the subject.</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button icon="mynaui:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useSubjectStore()
const toast = useToast()
const isLoading = ref(false)

type SubjectForm = {
    name: string
    code: string
    description: string
}

// reactive form state
const state = reactive<SubjectForm>({
    name: '',
    code: '',
    description: ''
})

// yup validation schema
const schema = yup.object({
    name: yup.string().required('Name is required'),
    code: yup.string().required('Code is required'),
    description: yup.string().required('Description is required')
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.name = ''
    state.code = ''
    state.description = ''
}

const onSubmit = async (event: FormSubmitEvent<SubjectForm>) => {
    event.preventDefault()
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })
        await store.create({
            name: state.name,
            code: state.code,
            description: state.description
        })

        await store.fetchAll()
        toast.add({ description: 'Subject created successfully', color: 'success' })
        close()
    } catch (err: any) {
        toast.add({ description: err.message, color: 'error' })
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    store.fetchAll()
})
</script>
