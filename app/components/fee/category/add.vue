<script setup lang="ts">
import * as yup from 'yup'

const { category } = defineProps<{ category?: FeeCategory }>()

const store = useFeeStore()
const { error: toastError, success: toastSuccess } = useNotify()

const isEdit = computed(() => !!category)
const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

function defaultState() {
    return {
        name: category?.name || '',
        description: category?.description || ''
    }
}

const state = reactive(defaultState())

const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required')
})

const close = () => {
    open.value = false
    Object.assign(state, defaultState())
}

const onSubmit = async () => {
    isLoading.value = true

    try {
        if (isEdit.value && category) {
            await store.updateCategory({
                id: category.id,
                ...state
            })

            toastSuccess('Fee category updated successfully')
        } else {
            await store.create(state)
            await store.fetchAll()

            toastSuccess('Fee category created successfully')
        }

        close()
    } catch (err: any) {
        toastError(err?.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <USlideover v-model:open="open" :dismissible="false">
        <!-- Trigger -->
        <div>
            <UButton v-if="isEdit" :icon="EDIT_ICON" size="xs" color="neutral" variant="ghost" />

            <div v-else>
                <UButton color="primary" label="Fee Category" icon="prime:plus" class="hidden md:flex" />

                <UButton color="primary" icon="prime:plus" class="md:hidden" />
            </div>
        </div>

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">
                    {{ isEdit ? 'Edit Fee Category' : 'Add Fee Category' }}
                </p>

                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" placeholder="e.g. Tuition, Library, Exam" :disabled="isLoading" />

                    <template #help>
                        <p class="text-xs text-muted">
                            Enter the name of the fee category.
                        </p>
                    </template>
                </UFormField>

                <UFormField label="Description" name="description" required>
                    <UTextarea v-model="state.description" placeholder="Enter a short description" :disabled="isLoading"
                        :rows="3" />

                    <template #help>
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
                <UButton icon="lucide:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />

                <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
            </div>
        </template>
    </USlideover>
</template>