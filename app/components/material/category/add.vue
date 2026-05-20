<template>
    <USlideover :dismissible="false" v-model:open="open">
        <!-- Trigger -->
        <UButton color="primary" label="Add Material Category" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Material Category</p>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
                <UFormField label="Name" name="name" required>
                    <UInput
                        v-model="state.name"
                        placeholder="e.g. Stationery, Laboratory, Cleaning Supplies"
                        :disabled="isLoading"
                    />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter a clear category name for school materials.
                        </p>
                    </template>
                </UFormField>

                <UFormField label="Description" name="description" required>
                    <UTextarea
                        v-model="state.description"
                        placeholder="Describe what items belong to this category"
                        :disabled="isLoading"
                        :rows="3"
                    />
                    <template #help>
                        <p class="text-xs text-muted">
                            Briefly explain what this category includes.
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
    </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useMaterialStore()
const { error: toastError, success: toastSuccess } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

type MaterialCategoryForm = {
    name: string
    description: string
}

const state = reactive<MaterialCategoryForm>({
    name: '',
    description: ''
})

const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required')
})

const close = () => {
    open.value = false
    state.name = ''
    state.description = ''
}

const onSubmit = async (event: FormSubmitEvent<MaterialCategoryForm>) => {
    isLoading.value = true

    try {
        await store.createCategory(state)
        await store.fetchAllCategory()

        toastSuccess('Material category created successfully')

        close()
    } catch (err: any) {
        toastError(err?.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}
</script>