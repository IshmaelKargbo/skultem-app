<template>
    <USlideover :dismissible="false" v-model:open="open">
        <!-- Trigger -->
        <UButton color="primary" label="Fee Category" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Fee Category</p>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" placeholder="e.g. Tuition, Library, Exam" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">
                            Enter the name of the fee category.
                        </p>
                    </template>
                </UFormField>

                <UFormField label="Description" name="description" required>
                    <UTextarea v-model="state.description" placeholder="Enter a short description" :disabled="isLoading"
                        :rows="3" />
                    <template #hint>
                        <p class="text-xs text-muted">
                            Brief explanation of what this fee covers.
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="lucide:save" :loading="isLoading" label="Save"
                    @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useFeeStore()
const toast = useToast()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

type FeeCategoryForm = {
    name: string
    description: string
}

const state = reactive<FeeCategoryForm>({
    name: '',
    description: ''
})

const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required')
})

const close = () => {
    open.value = false
    state.description = ''
    state.name = ''
}

const onSubmit = async (event: FormSubmitEvent<FeeCategoryForm>) => {
    isLoading.value = true

    try {
        await store.create(event.data)
        await store.fetchAll()

        toast.add({
            description: 'Fee category created successfully',
            color: 'success'
        })

        close()
    } catch (err: any) {
        toast.add({
            description: err?.message || 'Something went wrong',
            color: 'error'
        })
    } finally {
        isLoading.value = false
    }
}
</script>
