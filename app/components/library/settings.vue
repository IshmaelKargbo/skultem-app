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

// Each section (e.g. Primary, Secondary) can run its own library with its own rules. '' = the school's rules,
// which every section without rules of its own uses. Staff limited to sections only get their own.
const librarySections = useLibrarySections()
const { scope, load: loadScope } = useMyScope()
const wholeSchool = computed(() => !scope.value || scope.value.wholeSchool)
const selectedSection = ref('')
const ownRules = ref(true)

const sectionItems = computed(() => [
  ...(wholeSchool.value ? [{ label: 'Whole school (default rules)', value: '' }] : []),
  ...librarySections.options.value.map(o => ({ label: `${o.label} library`, value: o.value }))
])
// Worth a picker only when there's more than one library to choose from.
const showPicker = computed(() => librarySections.required.value && sectionItems.value.length > 1)
const sectionName = computed(() => librarySections.nameOf(selectedSection.value))
const resetting = ref(false)

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
    const saved = await store.saveSettings({ ...state, sectionId: selectedSection.value || null })
    if (!saved) return
    Object.assign(state, saved)
    ownRules.value = true
    toastSuccess(sectionName.value ? `${sectionName.value} library rules saved` : 'Library settings saved')
  } catch (err: any) {
    toastError(err?.message || 'Failed to save settings')
  } finally {
    saving.value = false
  }
}

// A failed load shows an error, never the form - saving defaults over the school's real settings would be worse.
const loadError = ref<string | null>(null)
async function loadSettings() {
  loading.value = true
  loadError.value = null
  try {
    const res = await store.fetchSettings(selectedSection.value || null)
    if (!res) throw new Error('Failed to load settings')
    Object.assign(state, res)
    ownRules.value = res.ownRules !== false
    // Section-limited staff get their own section back when they didn't pick one.
    if (!selectedSection.value && res.sectionId) selectedSection.value = res.sectionId
  } catch (err: any) {
    loadError.value = err?.message || 'Failed to load settings'
  } finally {
    loading.value = false
  }
}
async function useSchoolRules() {
  if (!selectedSection.value) return
  resetting.value = true
  try {
    const res = await store.resetSettings(selectedSection.value)
    if (!res) return
    Object.assign(state, res)
    ownRules.value = false
    toastSuccess(`${sectionName.value ?? 'This section'} now uses the school's rules`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to reset the rules')
  } finally {
    resetting.value = false
  }
}

watch(selectedSection, (next, prev) => {
  if (next !== prev && !loading.value) loadSettings()
})

onMounted(async () => {
  await Promise.all([librarySections.load(), loadScope()])
  // Staff limited to sections start on their first section; whole-school staff on the school's rules.
  if (!wholeSchool.value && librarySections.options.value.length) {
    selectedSection.value = librarySections.options.value[0]!.value
  }
  await loadSettings()
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

        <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <USelectMenu data-guide="lib-set-section" v-if="showPicker" v-model="selectedSection" value-key="value" :items="sectionItems"
            :search-input="false" :disabled="loading || saving" class="w-full sm:w-60" />
          <UButton data-guide="lib-set-save" :icon="SAVE_ICON" label="Save Changes" :loading="saving" :disabled="loading" @click="formRef?.submit()" />
        </div>
      </div>
    </template>

    <template v-if="!loading && !loadError && librarySections.required.value">
      <UAlert v-if="selectedSection && !ownRules" class="mb-4" color="info" variant="subtle" icon="i-lucide-info"
        :title="`${sectionName ?? 'This section'} uses the school's rules`"
        :description="`Change anything below and save to give the ${sectionName ?? 'section'} library its own rules.`" />
      <UAlert v-else-if="selectedSection" class="mb-4" color="neutral" variant="subtle" icon="i-lucide-library"
        :title="`${sectionName ?? 'This section'} library has its own rules`"
        description="Only books from this section's library follow these rules. Limits count only its books."
        :actions="[{ label: 'Use the school\'s rules', color: 'neutral', variant: 'outline', loading: resetting, onClick: useSchoolRules }]" />
      <UAlert v-else class="mb-4" color="neutral" variant="subtle" icon="i-lucide-school"
        title="The school's rules"
        description="Every section library without rules of its own follows these. Pick a section above to give it its own." />
    </template>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2">
      <div v-for="i in 4" :key="i" class="space-y-3 rounded-2xl border border-default p-4">
        <USkeleton class="h-4 w-36" />
        <USkeleton class="h-3 w-56 max-w-full" />
        <USkeleton class="h-9 w-full" />
      </div>
    </div>

    <StateLoadError v-else-if="loadError" bordered title="Couldn't load the library settings" :message="loadError"
      @retry="loadSettings" />

    <UForm data-guide="lib-set-form" v-else ref="formRef" :schema="schema" :state="state" class="grid gap-4 md:grid-cols-2" @submit="onSubmit">
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
