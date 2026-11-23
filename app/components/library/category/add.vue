<script setup lang="ts">
import * as yup from 'yup'

// hideTrigger: the page opens it itself (a list row opens the edit form) - see v-model:open.
const { category, hideTrigger, canDelete } = defineProps<{ category?: BookCategory, hideTrigger?: boolean, canDelete?: boolean }>()
const emit = defineEmits<{ delete: [category: BookCategory] }>()

function askDelete() {
  if (!category) return
  open.value = false
  emit('delete', category)
}

const store = useLibraryStore()
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!category)
const open = defineModel<boolean>('open', { default: false })
const isLoading = ref(false)
const formRef = ref()

const state = reactive({
  name: category?.name || '',
  description: category?.description || ''
})

// Refill from the latest category each time the form opens.
watch(open, (isOpen) => {
  if (!isOpen) return
  state.name = category?.name || ''
  state.description = category?.description || ''
})

const schema = yup.object({
  name: yup.string().required('Category name is required'),
  description: yup.string().max(500, 'Description must not exceed 500 characters')
})

function close() {
  open.value = false
  state.name = category?.name || ''
  state.description = category?.description || ''
}

async function onSubmit() {
  isLoading.value = true

  try {
    await store.saveCategory({ ...state }, category?.id)
    toastSuccess(isEdit.value ? 'Category updated successfully' : 'Category created successfully')
    close()
  } catch (err: any) {
    toastError(err?.message || 'Something went wrong')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <USlideover :dismissible="false" v-model:open="open">
    <template v-if="hideTrigger" />
    <UButton
      v-else-if="isEdit"
      :icon="EDIT_ICON"
      size="xs"
      color="neutral"
      variant="ghost"
      @click="() => { open = true }"
    />
    <UButton v-else color="primary" label="Add Category" :icon="ADD_ICON" @click="() => { open = true }" />

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">{{ isEdit ? 'Edit Category' : 'Add Category' }}</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="e.g. Fiction" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="state.description"
            placeholder="Briefly describe this category"
            :rows="3"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full items-center gap-3">
        <UButton :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
        <!-- Delete lives here now that the list's rows open this form. -->
        <UButton v-if="isEdit && canDelete" class="ml-auto" label="Delete" :icon="DELETE_ICON" color="error"
          variant="soft" :disabled="isLoading" @click="askDelete" />
      </div>
    </template>
  </USlideover>
</template>
