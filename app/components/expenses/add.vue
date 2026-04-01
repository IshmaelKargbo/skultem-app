<template>
  <u-slideover :dismissible="false" title="Add Expense" :open="open" @update:open="open = $event">

    <!-- Trigger -->
    <UButton color="primary" label="Add Expense" icon="prime:plus" @click="open = true" />

    <!-- Header -->
    <template #header>
      <div class="flex justify-between w-full items-center">
        <p class="text-lg font-semibold">Add Expense</p>
        <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">

        <!-- Name -->
        <UFormField label="Name" name="name" required>
          <UInput type="text" v-model="state.name" placeholder="Enter expense name" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">
              Provide a descriptive title for the expense (e.g., "Lab Equipment Purchase").
            </p>
          </template>
        </UFormField>
        
        <!-- Category -->
        <UFormField label="Category" name="categoryId" required>
          <USelectMenu value-key="value" :items="categories" v-model="state.category" placeholder="Select category"
            :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">
              Choose the category this expense belongs to (e.g., Supplies, Maintenance, Miscellaneous).
            </p>
          </template>
        </UFormField>

        <!-- Amount -->
        <UFormField label="Amount" name="amount" required>
          <UInput type="number" v-model="state.amount" placeholder="Enter expense amount" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">
              Enter the total amount for this expense. Must be greater than 0.
            </p>
          </template>
        </UFormField>

        <!-- Description -->
        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" placeholder="Optional notes about the expense" :disabled="isLoading" />
          <template #help>
            <p class="text-xs text-muted">
              Add any additional notes or instructions for this expense (optional).
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

  </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref, computed, onMounted } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useExpenseStore()
const { error: toastError, success: toastSuccess } = useNotify()

const isLoading = ref(false)
const open = ref(false)
const emit = defineEmits(['refresh-report'])
const formRef = ref<any>(null)

const categories = computed(() =>
  store.categories.map(e => ({
    label: e.name,
    value: e.id
  }))
)

type ExpenseForm = {
  name: string
  category: string
  amount: number | null
  description: string
}

const state = reactive<ExpenseForm>({
  name: '',
  category: '',
  amount: null,
  description: ''
})

const schema = yup.object({
  name: yup.string().required('Name is required'),
  category: yup.string().required('Category is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .positive('Amount must be greater than 0'),
  description: yup.string().required('Description is required')
})

const close = () => {
  open.value = false
  state.name = ''
  state.category = ''
  state.amount = null
  state.description = ''
}

const onSubmit = async (_event: FormSubmitEvent<ExpenseForm>) => {
  isLoading.value = true
  try {
    await schema.validate(state, { abortEarly: false })

    await store.create({
      name: state.name,
      category: state.category,
      amount: state.amount || 0,
      description: state.description
    })

    await store.fetchAll()
    toastSuccess('Expense created successfully')
    emit('refresh-report')
    close()
  } catch (err: any) {
    toastError(err.errors?.[0] || err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  store.fetchAllCategories()
})
</script>