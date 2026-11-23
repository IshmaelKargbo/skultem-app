<template>
    <USlideover :dismissible="false" v-model:open="open">
        <!-- Trigger -->
        <template v-if="hideTrigger" />
        <UButton v-else-if="isEdit" :icon="EDIT_ICON" size="xs" color="neutral" variant="ghost" @click="open = true" />
        <div v-else>
            <UButton color="primary" class="md:hidden" icon="prime:plus" />
            <UButton color="primary" class="hidden md:flex" label="Add Material Category" icon="prime:plus" />
        </div>

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">{{ isEdit ? 'Edit Material Category' : 'Add Material Category' }}</p>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" placeholder="e.g. Stationery, Laboratory, Cleaning Supplies"
                        :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter a clear category name for school materials.
                        </p>
                    </template>
                </UFormField>

                <UFormField label="Description" name="description" required>
                    <UTextarea v-model="state.description" placeholder="Describe what items belong to this category"
                        :disabled="isLoading" :rows="3" />
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
            <div class="flex w-full items-center gap-3">
                <UButton icon="lucide:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
                <!-- Delete lives here now that the list's rows open this form. -->
                <UButton v-if="isEdit && canDelete" class="ml-auto" label="Delete" icon="i-lucide-trash-2" color="error"
                    variant="soft" :disabled="isLoading" @click="askDelete" />
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

// hideTrigger: the page opens it itself (a list row opens the edit form) - see v-model:open.
const { category, hideTrigger, canDelete } = defineProps<{ category?: MaterialCategory, hideTrigger?: boolean, canDelete?: boolean }>()
const emit = defineEmits<{ saved: [], delete: [category: MaterialCategory] }>()

const store = useMaterialStore()
const { error: toastError, success: toastSuccess } = useNotify()

const isEdit = computed(() => !!category)
const open = defineModel<boolean>('open', { default: false })
const isLoading = ref(false)
const formRef = ref()

type MaterialCategoryForm = {
    name: string
    description: string
}

function defaultState(): MaterialCategoryForm {
    return {
        name: category?.name || '',
        description: category?.description || ''
    }
}

const state = reactive<MaterialCategoryForm>(defaultState())

// Filled from the category each time the form opens (one form is reused for every row).
watch(open, (isOpen) => {
    if (isOpen) Object.assign(state, defaultState())
})

function askDelete() {
    if (!category) return
    open.value = false
    emit('delete', category)
}

const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required')
})

const close = () => {
    open.value = false
    Object.assign(state, defaultState())
}

const onSubmit = async (event: FormSubmitEvent<MaterialCategoryForm>) => {
    isLoading.value = true

    try {
        if (isEdit.value && category) {
            await store.updateCategory({ id: category.id, ...state })
            toastSuccess('Material category updated successfully')
            emit('saved')
        } else {
            await store.createCategory(state)
            await store.fetchAllCategory()
            toastSuccess('Material category created successfully')
            emit('saved')
        }

        close()
    } catch (err: any) {
        toastError(err?.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}
</script>
