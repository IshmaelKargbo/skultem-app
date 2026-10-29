<script setup lang="ts">
import * as yup from 'yup'

const store = useLibraryStore()
const { success: toastSuccess, error: toastError } = useNotify()

const loading = ref(true)
const saving = ref(false)
const formRef = ref()

const state = reactive<LibrarySettings>({
  maxStudentLoans: 2,
  maxTeacherLoans: 5,
  blockWhenOverdue: true,
  defaultLoanDays: 14
})

const limit = (who: string) => yup.number().typeError('Enter a number').integer('Enter a whole number')
  .min(1, `${who} must be allowed at least 1 book`).max(50, 'No more than 50 books').required()

const schema = yup.object({
  maxStudentLoans: limit('Students'),
  maxTeacherLoans: limit('Teachers'),
  defaultLoanDays: yup.number().typeError('Enter a number').integer('Enter a whole number')
    .min(1, 'At least 1 day').max(365, 'No more than 365 days').required()
})

async function onSubmit() {
  saving.value = true
  try {
    Object.assign(state, await store.saveSettings({ ...state }))
    toastSuccess('Library settings saved')
  } catch (err: any) {
    toastError(err?.message || 'Failed to save settings')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    Object.assign(state, await store.fetchSettings())
  } catch (err: any) {
    toastError(err?.message || 'Failed to load settings')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shield-check" class="size-5 text-primary" />
            <h3 class="font-semibold md:text-lg">Borrowing Rules</h3>
          </div>
          <p class="text-xs-base text-muted">How many books people can hold, and what happens when a book is overdue.</p>
        </div>

        <UButton :icon="SAVE_ICON" label="Save Changes" :loading="saving" :disabled="loading" @click="formRef?.submit()" />
      </div>
    </template>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-2xl" />
    </div>

    <UForm v-else ref="formRef" :schema="schema" :state="state" class="grid gap-4 md:grid-cols-2" @submit="onSubmit">
      <div class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
        <UFormField label="Books a student can hold" name="maxStudentLoans"
          description="A student must return one before borrowing more.">
          <UInput v-model.number="state.maxStudentLoans" type="number" min="1" max="50" :disabled="saving" class="w-full" />
        </UFormField>
      </div>

      <div class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
        <UFormField label="Books a teacher can hold" name="maxTeacherLoans"
          description="Usually higher, as teachers often borrow for a class.">
          <UInput v-model.number="state.maxTeacherLoans" type="number" min="1" max="50" :disabled="saving" class="w-full" />
        </UFormField>
      </div>

      <div class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
        <UFormField label="Default loan period (days)" name="defaultLoanDays"
          description="Sets the due date the Issue Book form starts with. It can still be changed per loan.">
          <UInput v-model.number="state.defaultLoanDays" type="number" min="1" max="365" :disabled="saving" class="w-full" />
        </UFormField>
      </div>

      <div class="flex items-start justify-between gap-4 rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800">
        <div>
          <p class="text-sm font-medium text-highlighted">Block borrowing while a book is overdue</p>
          <p class="mt-1 text-sm text-muted">
            A student or teacher with an overdue book can't borrow another until it's returned.
          </p>
        </div>
        <USwitch v-model="state.blockWhenOverdue" :disabled="saving" />
      </div>
    </UForm>
  </UCard>
</template>
