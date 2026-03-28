<template>
  <USlideover v-model:open="open" :dismissible="false">
    <!-- Trigger -->
    <UButton
      color="primary"
      label="Expense Category"
      icon="prime:plus"
      @click="open = true"
    />

    <!-- Header -->
    <template #header>
      <div class="flex justify-between items-center w-full">
        <p class="text-lg font-semibold">Add Expense Category</p>
        <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        class="space-y-5"
        @submit="onSubmit"
      >
        <!-- Name -->
        <UFormField label="Name" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Example: Transport, Maintenance, Electricity"
            :disabled="isLoading"
          />

          <template #help>
            <p class="text-xs text-muted">
              The main label used to organize school expenses. Choose something clear and easy to recognize.
            </p>
          </template>
        </UFormField>

        <!-- Description -->
        <UFormField label="Description" name="description" required>
          <UTextarea
            v-model="state.description"
            placeholder="Example: Expenses related to school vehicle fuel, repairs, and transportation costs."
            :rows="3"
            :disabled="isLoading"
          />

          <template #help>
            <p class="text-xs text-muted">
              Provide a short explanation of what expenses belong in this category.
            </p>
          </template>
        </UFormField>
      </UForm>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3">
        <UButton
          icon="lucide:save"
          label="Save Category"
          :loading="isLoading"
          @click="formRef?.submit()"
        />

        <UButton
          label="Cancel"
          variant="outline"
          color="neutral"
          :disabled="isLoading"
          @click="close"
        />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useExpenseStore()
const { success: toastSuccess, error: toastError } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref()

type ExpenseCategoryForm = {
  name: string
  description: string
}

const initialState: ExpenseCategoryForm = {
  name: '',
  description: ''
}

const state = reactive<ExpenseCategoryForm>({ ...initialState })

const schema = yup.object({
  name: yup.string().required('Category name is required'),
  description: yup.string().required('Description is required')
})

function resetForm() {
  Object.assign(state, initialState)
}

function close() {
  open.value = false
  resetForm()
}

async function onSubmit(event: FormSubmitEvent<ExpenseCategoryForm>) {
  try {
    isLoading.value = true

    await store.createCreate(event.data)
    await store.fetchAllCategories(1, runtimeConf().limit)

    toastSuccess('Expense category created successfully')
    close()
  } catch (err: any) {
    toastError(err?.message || 'Something went wrong')
  } finally {
    isLoading.value = false
  }
}
</script>