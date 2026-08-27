<script setup lang="ts">
import * as yup from 'yup'

const { category } = defineProps<{ category?: BookCategory }>()

const store = useLibraryStore()
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!category)
const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

const state = reactive({
  name: category?.name || '',
  description: category?.description || ''
})

const schema = yup.object({
  name: yup.string().required('Category name is required'),
  description: yup.string().required('Description is required')
})

function close() {
  open.value = false
  state.name = category?.name || ''
  state.description = category?.description || ''
}

async function onSubmit() {
  isLoading.value = true

  try {
    if (isEdit.value && category) {
      store.updateCategory({ id: category.id, ...state })
      toastSuccess('Category updated successfully')
    } else {
      store.createCategory(state)
      toastSuccess('Category created successfully')
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
  <USlideover :dismissible="false" v-model:open="open">
    <UButton
      v-if="isEdit"
      :icon="EDIT_ICON"
      size="xs"
      color="neutral"
      variant="ghost"
      @click="open = true"
    />
    <UButton v-else color="primary" label="Add Category" :icon="ADD_ICON" @click="open = true" />

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

        <UFormField label="Description" name="description" required>
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
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </USlideover>
</template>
