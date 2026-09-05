<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Add Salary Template" subtitle="A reusable compensation package you can apply to any teacher.">
      <UButton variant="soft" color="neutral" to="/payroll/salary-templates" label="Cancel" />
      <UButton icon="i-lucide-check" :loading="saving" label="Save Template" @click="formRef?.submit()" />
    </Heading>

    <UForm ref="formRef" :state="state" :schema="schema" class="grid gap-4 lg:grid-cols-3" @submit="onSubmit">

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
        <UCard class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
          <div class="bg-primary p-6 text-center text-inverted">
            <p class="text-sm opacity-80">Net Salary (preview)</p>
            <h1 class="mt-3 text-4xl font-bold">{{ formatCurrency(netSalary) }}</h1>
            <p class="mt-2 text-xs opacity-75">
              {{ formatCurrency(grossSalary) }} gross − {{ formatCurrency(totalDeductions) }} deductions
            </p>
          </div>

          <div class="space-y-2 p-4 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">Basic Salary</span>
              <span class="font-medium">{{ formatCurrency(state.basicSalary) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Allowances ({{ state.allowances.length }})</span>
              <span class="font-medium text-success">+ {{ formatCurrency(totalAllowances) }}</span>
            </div>
            <div class="flex justify-between border-t border-default pt-2">
              <span class="text-muted">Gross Salary</span>
              <span class="font-medium">{{ formatCurrency(grossSalary) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Deductions ({{ state.deductions.length }})</span>
              <span class="font-medium text-error">- {{ formatCurrency(totalDeductions) }}</span>
            </div>
          </div>
        </UCard>
      </div>

    </UForm>

  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const router = useRouter()
const notify = useNotify()
const store = usePayrollStore()

const formRef = ref()
const saving = ref(false)

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

const totalAllowances = computed(() => state.allowances.reduce((sum, a) => sum + resolvePayComponent(a, state.basicSalary || 0), 0))
const totalDeductions = computed(() => state.deductions.reduce((sum, d) => sum + resolvePayComponent(d, state.basicSalary || 0), 0))
const grossSalary = computed(() => (Number(state.basicSalary) || 0) + totalAllowances.value)
const netSalary = computed(() => grossSalary.value - totalDeductions.value)

function formatCurrency(value?: number | null) {
  return `Le ${Number(value || 0).toLocaleString()}`
}

function stripRow(row: PayComponentRow): PayComponent {
  const { key, resolvedAmount, ...rest } = row
  return rest
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  saving.value = true
  try {
    await store.createSalaryTemplate({
      name: state.name,
      basicSalary: state.basicSalary,
      allowances: state.allowances.map(stripRow),
      deductions: state.deductions.map(stripRow)
    })
    notify.success('Salary template created.')
    await router.push('/payroll/salary-templates')
  } catch (err: any) {
    notify.error(err?.message || 'Unable to create salary template.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('Add Salary Template')
  useAppStore().setBack('/payroll/salary-templates')
  document.title = 'Add Salary Template | Payroll | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
