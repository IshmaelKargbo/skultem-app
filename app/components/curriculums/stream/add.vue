<template>
    <u-slideover :dismissible="false" title="Add Stream" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton color="primary" label="Add Stream" :icon="ADD_ICON" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Stream</p>
                <u-button :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <UFormField required label="Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Art, Science, Com" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the name of the stream (e.g. Art, Science, Com).</p>
                    </template>
                </UFormField>
                <UFormField required label="Description" name="description">
                    <UTextarea v-model="state.description" placeholder="Enter description" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the description of the stream.</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useStreamStore()
const { error: toastError, success: toastSuccess } = useNotify()
const isLoading = ref(false)

type StreamForm = {
    name: string
    description: string
}

const state = reactive<StreamForm>({
    name: '',
    description: ''
})

const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required("Description is required")
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.name = ''
    state.description = ''
}

const onSubmit = async (event: FormSubmitEvent<StreamForm>) => {
    event.preventDefault()
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })
        await store.create({
            name: state.name,
            description: state.description
        })

        await store.fetchAll()
        toastSuccess('Stream created successfully')
        close()
    } catch (err: any) {
        toastError(err.message)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    store.fetchAll()
})
</script>
