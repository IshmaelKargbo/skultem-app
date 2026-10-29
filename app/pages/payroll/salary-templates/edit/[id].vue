<template>
  <div class="space-y-3 px-4 md:px-6">

    <Heading title="Edit Salary Template" subtitle="Changes only affect teachers set up from this template after you save.">
      <UButton variant="soft" color="neutral" to="/payroll/salary-templates" label="Cancel" />
      <UButton icon="i-lucide-check" :loading="saving" :disabled="loading" label="Save Changes" @click="formRef?.submit()" />
    </Heading>

    <div v-if="loading" class="grid gap-4 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <USkeleton class="h-40 w-full rounded-xl" />
        <USkeleton class="h-40 w-full rounded-xl" />
        <USkeleton class="h-40 w-full rounded-xl" />
      </div>
      <USkeleton class="h-56 w-full rounded-xl" />
    </div>

    <UForm v-else ref="formRef" :state="state" :schema="schema" class="grid gap-4 lg:grid-cols-3" @submit="onSubmit">

      <!-- Left -->
      <div class="space-y-4 lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-template" class="text-primary" />
              <span class="font-semibold">Template</span>
            </div>
          </template>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Template Name" name="name" required class="md:col-span-2">
              <UInput v-model="state.name" placeholder="e.g. Grade A Teacher" class="w-full" />
            </UFormField>

            <UFormField label="Basic Salary" name="basicSalary" required>
              <UInput v-model.number="state.basicSalary" type="number" min="0" placeholder="0" class="w-full">
                <template #leading><span class="text-sm text-muted">Le</span></template>
              </UInput>
              <template #help>
                <p class="text-xs text-muted">Percentage lines below are computed against this amount.</p>
              </template>
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <PayrollPayComponentEditor v-model="state.allowances" label="Allowances" color="success"
            :basic-salary="state.basicSalary || 0" />
        </UCard>

        <UCard>
          <PayrollPayComponentEditor v-model="state.deductions" label="Deductions" color="error"
            :basic-salary="state.basicSalary || 0" />
        </UCard>
      </div>

      <!-- Right -->
      <div class="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <PayrollNetPreview :basic="state.basicSalary" :allowances="totalAllowances" :deductions="totalDeductions"
          :allowance-count="state.allowances.length" :deduction-count="state.deductions.length" />
      </div>

    </UForm>

  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

const route = useRoute()
const router = useRouter()
const notify = useNotify()
const store = usePayrollStore()

const formRef = ref()
const saving = ref(false)
const loading = ref(true)

const templateId = route.params.id as string

const state = reactive<{
  name: string
  basicSalary: number
  allowances: PayComponentRow[]
  deductions: PayComponentRow[]
}>({
  name: '',
  basicSalary: 0,
  allowances: [],
  deductions: []
})

const schema = yup.object({
  name: yup.string().required('Template name is required'),
  basicSalary: yup.number().min(0, 'Basic salary cannot be negative').required('Basic salary is required')
})

function toRows(items: PayComponent[]): PayComponentRow[] {
  return items.map(item => ({ ...item, key: crypto.randomUUID() }))
}

const totalAllowances = computed(() => state.allowances.reduce((sum, a) => sum + resolvePayComponent(a, state.basicSalary || 0), 0))
const totalDeductions = computed(() => state.deductions.reduce((sum, d) => sum + resolvePayComponent(d, state.basicSalary || 0), 0))

function stripRow(row: PayComponentRow): PayComponent {
  const { key, resolvedAmount, ...rest } = row
  return rest
}

async function onSubmit() {
  saving.value = true
  try {
    await store.updateSalaryTemplate(templateId, {
      name: state.name,
      basicSalary: state.basicSalary,
      allowances: state.allowances.map(stripRow),
      deductions: state.deductions.map(stripRow)
    })
    notify.success('Salary template updated.')
    await router.push('/payroll/salary-templates')
  } catch (err: any) {
    notify.error(err?.message || 'Unable to update salary template.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('Edit Salary Template')
  useAppStore().setBack('/payroll/salary-templates')
  document.title = 'Edit Salary Template | Payroll | Skultem'

  loading.value = true
  try {
    const existing = await store.fetchSalaryTemplate(templateId)
    if (existing) {
      state.name = existing.name
      state.basicSalary = existing.basicSalary
      state.allowances = toRows(existing.allowances)
      state.deductions = toRows(existing.deductions)
    } else {
      notify.error('Salary template not found.')
      await router.push('/payroll/salary-templates')
    }
  } finally {
    loading.value = false
  }
})

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
