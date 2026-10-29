<script setup lang="ts">
import * as yup from 'yup'

const { book } = defineProps<{ book?: Book }>()

const store = useLibraryStore()
const { categoryOptions } = storeToRefs(store)
const { success: toastSuccess, error: toastError } = useNotify()

const isEdit = computed(() => !!book)
const open = ref(false)
const isLoading = ref(false)
const formRef = ref()


function defaultState() {
  return {
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn ?? '',
    publisher: book?.publisher ?? '',
    categoryId: book?.category.id || '',
    totalCopies: book?.totalCopies ?? 1,
    shelf: book?.shelf ?? ''
  }
}

const state = reactive(defaultState())

// Refill from the latest book each time the form opens, and make sure the category list is loaded.
watch(open, (isOpen) => {
  if (!isOpen) return
  Object.assign(state, defaultState())
  if (!categoryOptions.value.length) store.fetchCategoryOptions()
})

const schema = yup.object({
  title: yup.string().required('Title is required'),
  author: yup.string().required('Author is required'),
  isbn: yup.string().max(32, 'ISBN must not exceed 32 characters'),
  publisher: yup.string(),
  categoryId: yup.string().required('Category is required'),
  totalCopies: yup.number().typeError('Enter a number').integer('Enter a whole number').min(1, 'At least 1 copy is required').required(),
  shelf: yup.string().max(50, 'Shelf must not exceed 50 characters')
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

// Lets a parent open the form from its own control (e.g. an actions menu) with no trigger button.
defineExpose({ open: () => { open.value = true } })

async function onSubmit() {
  isLoading.value = true

  try {
    await store.saveBook({ ...state }, book?.id)
    toastSuccess(isEdit.value ? 'Book updated successfully' : 'Book added successfully')
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
    <slot name="trigger" :open="() => (open = true)">
      <UButton
        v-if="isEdit"
        :icon="EDIT_ICON"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="open = true"
      />
      <UButton v-else color="primary" label="Add Book" :icon="ADD_ICON" @click="open = true" />
    </slot>

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">{{ isEdit ? 'Edit Book' : 'Add Book' }}</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Title" name="title" required>
          <UInput v-model="state.title" placeholder="e.g. Things Fall Apart" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Author" name="author" required>
          <UInput v-model="state.author" placeholder="e.g. Chinua Achebe" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="ISBN" name="isbn">
          <UInput v-model="state.isbn" placeholder="e.g. 978-0385474542" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Publisher" name="publisher">
          <UInput v-model="state.publisher" placeholder="e.g. Heinemann" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Category" name="categoryId" required>
          <USelectMenu v-model="state.categoryId" value-key="value" :items="categoryOptions" placeholder="Select category" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Total Copies" name="totalCopies" required>
          <UInput v-model.number="state.totalCopies" type="number" min="1" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Shelf" name="shelf">
          <UInput v-model="state.shelf" placeholder="e.g. A1" :disabled="isLoading" class="w-full" />
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
