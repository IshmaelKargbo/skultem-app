<script setup lang="ts">
import * as yup from 'yup'

const store = useLibraryStore()
const { books } = storeToRefs(store)
const { success: toastSuccess, error: toastError } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

const bookOptions = computed(() =>
  books.value
    .filter(b => b.availableCopies > 0)
    .map(b => ({ label: `${b.title} · ${b.availableCopies} available`, value: b.id }))
)

function defaultDueDate() {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().slice(0, 10)
}

function defaultState() {
  return {
    bookId: '',
    borrowerName: '',
    borrowerType: 'STUDENT' as 'STUDENT' | 'TEACHER',
    borrowerClass: '',
    dueDate: defaultDueDate()
  }
}

const state = reactive(defaultState())

const schema = yup.object({
  bookId: yup.string().required('Select a book'),
  borrowerName: yup.string().required('Borrower name is required'),
  borrowerType: yup.string().required(),
  borrowerClass: yup.string().required('Class / department is required'),
  dueDate: yup.string().required('Due date is required')
})

function close() {
  open.value = false
  Object.assign(state, defaultState())
}

async function onSubmit() {
  isLoading.value = true

  try {
    store.issueBook({
      ...state,
      dueDate: new Date(state.dueDate).toISOString()
    })
    toastSuccess('Book issued successfully')
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
    <UButton color="primary" label="Issue Book" :icon="ISSUE_BOOK_ICON" @click="open = true" />

    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="text-lg font-semibold">Issue Book</p>
        <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Book" name="bookId" required>
          <USelectMenu v-model="state.bookId" value-key="value" :items="bookOptions" placeholder="Select an available book" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Borrower Type" name="borrowerType" required>
          <USelectMenu v-model="state.borrowerType" value-key="value" :items="borrowerTypes" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Borrower Name" name="borrowerName" required>
          <UInput v-model="state.borrowerName" placeholder="e.g. Aminata Kamara" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField :label="state.borrowerType === 'TEACHER' ? 'Department' : 'Class'" name="borrowerClass" required>
          <UInput v-model="state.borrowerClass" :placeholder="state.borrowerType === 'TEACHER' ? 'e.g. Mathematics' : 'e.g. JSS 2A'" :disabled="isLoading" class="w-full" />
        </UFormField>

        <UFormField label="Due Date" name="dueDate" required>
          <UInput v-model="state.dueDate" type="date" :disabled="isLoading" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton :icon="SAVE_ICON" :loading="isLoading" label="Issue Book" @click="formRef?.submit()" />
        <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
      </div>
    </template>
  </USlideover>
</template>
