<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading :title="isEdit ? 'Edit Salary' : 'Add Salary'" subtitle="Set up a compensation package for a teacher.">
      <UButton variant="soft" color="neutral" to="/payroll/salaries" label="Cancel" />
      <UButton icon="i-lucide-check" :loading="saving" label="Save Salary" @click="formRef?.submit()" />
    </Heading>

    <UForm ref="formRef" :state="state" :schema="schema" class="grid gap-4 lg:grid-cols-3" @submit="onSubmit">

      <!-- Left -->
      <div class="space-y-4 lg:col-span-2">

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user" class="text-primary" />
              <span class="font-semibold">Teacher</span>
            </div>
          </template>

          <UFormField label="Select Teacher" name="teacherId" required>
            <USelectMenu v-model="state.teacherId" :items="teacherOptions" :loading="loadingTeachers"
              value-key="value" label-key="label" icon="i-lucide-search"
              placeholder="Search teachers…" class="w-full" :disabled="isEdit" />
          </UFormField>

          <div v-if="selectedTeacher" class="mt-4 flex items-center gap-4 rounded-xl border border-default p-4">
            <UAvatar size="lg" :alt="selectedTeacher.label" />
            <div>
              <p class="font-semibold leading-tight">{{ selectedTeacher.label }}</p>
              <p class="text-sm text-muted">{{ selectedTeacher.staffId }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-template" class="text-primary" />
              <span class="font-semibold">Start from a Template</span>
            </div>
          </template>

          <UFormField name="templateId">
            <USelectMenu v-model="state.templateId" :items="templateOptions" :loading="loadingTemplates"
              value-key="value" label-key="label" placeholder="No template - build from scratch" class="w-full"
              clear @update:model-value="onPickTemplate" />

            <template #help>
              <p class="text-xs text-muted">
                Picking a template fills in the basic salary and every allowance/deduction line below -
                you can still tweak any of it before saving. Leave this blank to build the list entirely by hand.
              </p>
            </template>
          </UFormField>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-wallet" class="text-primary" />
              <span class="font-semibold">Basic Salary</span>
            </div>
          </template>

          <UFormField label="Basic Salary" name="basicSalary" required>
            <UInput v-model.number="state.basicSalary" type="number" min="0" placeholder="0" class="w-full">
              <template #leading><span class="text-sm text-muted">Le</span></template>
            </UInput>
          </UFormField>
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

const route = useRoute()
const router = useRouter()
const notify = useNotify()

const teacherStore = useTeacherStore()
const { records: teachers } = storeToRefs(teacherStore)
const loadingTeachers = ref(false)

const payrollStore = usePayrollStore()
const { templates } = storeToRefs(payrollStore)
const loadingTemplates = ref(false)

// Preset via ?teacherId= when arriving from a teacher's salary page ("Edit Salary").
const isEdit = computed(() => !!route.query.teacherId)

const formRef = ref()
const saving = ref(false)

const state = reactive<{
  teacherId: string
  templateId: string
  basicSalary: number
  allowances: PayComponentRow[]
  deductions: PayComponentRow[]
}>({
  teacherId: String(route.query.teacherId ?? ''),
  templateId: '',
  basicSalary: 0,
  allowances: [],
  deductions: []
})

const schema = yup.object({
  teacherId: yup.string().required('Teacher is required'),
  basicSalary: yup.number().min(0, 'Basic salary cannot be negative').required('Basic salary is required')
})

const teacherOptions = computed(() => teachers.value.map(t => ({
  label: `${t.user?.givenNames || ''} ${t.user?.familyName || ''}`.trim(),
  value: t.id,
  staffId: t.staffId
})))

const templateOptions = computed(() => templates.value.map(t => ({ label: t.name, value: t.id })))

const selectedTeacher = computed(() => teacherOptions.value.find(t => t.value === state.teacherId))

function toRows(items: PayComponent[]): PayComponentRow[] {
  return items.map(item => ({ ...item, key: crypto.randomUUID() }))
}

async function onPickTemplate(templateId: string) {
  if (!templateId) return

  const template = await payrollStore.fetchSalaryTemplate(templateId)
  if (!template) return

  state.basicSalary = template.basicSalary
  state.allowances = toRows(template.allowances)
  state.deductions = toRows(template.deductions)
}

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
    await payrollStore.setSalary({
      teacherId: state.teacherId,
      templateId: state.templateId || null,
      basicSalary: state.basicSalary,
      allowances: state.allowances.map(stripRow),
      deductions: state.deductions.map(stripRow)
    })
    notify.success('Salary structure saved.')
    await router.push(`/payroll/salaries/${state.teacherId}`)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to save salary structure.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle(isEdit.value ? 'Edit Salary' : 'Add Salary')
  useAppStore().setBack('/payroll/salaries')
  document.title = `${isEdit.value ? 'Edit' : 'Add'} Salary | Payroll | Skultem`

  loadingTeachers.value = true
  loadingTemplates.value = true
  try {
    await Promise.all([
      teacherStore.fetchAll(1, 0),
      payrollStore.fetchSalaryTemplates(1, 0)
    ])
  } finally {
    loadingTeachers.value = false
    loadingTemplates.value = false
  }

  if (isEdit.value) {
    const existing = await PayrollApi().getSalaryByTeacher(state.teacherId)
    if (existing) {
      state.templateId = existing.templateId || ''
      state.basicSalary = existing.basicSalary
      state.allowances = toRows(existing.allowances)
      state.deductions = toRows(existing.deductions)
    }
  }
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
