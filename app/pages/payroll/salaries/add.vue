<template>
  <div class="space-y-3 px-4 md:px-6">

    <Heading :title="isEdit ? 'Edit Salary' : 'Add Salary'" subtitle="Set up a compensation package for a teacher.">
      <UButton variant="soft" color="neutral" to="/payroll/salaries" label="Cancel" />
      <UButton icon="i-lucide-check" :loading="saving" label="Save Salary" @click="formRef?.submit()" />
    </Heading>

    <UForm ref="formRef" :state="state" :schema="schema" class="grid gap-4 lg:grid-cols-3" @submit="onSubmit">

      <!-- Left -->
      <div class="space-y-4 lg:col-span-2">

        <UCard>
          <template #header>
            <div>
              <p class="font-semibold">Employee &amp; base pay</p>
              <p class="text-xs text-muted">Choose who this salary is for, then start from a template or enter it by hand.</p>
            </div>
          </template>

          <div class="space-y-5">
            <UFormField label="Employee" name="teacherId" required>
              <USelectMenu v-model="state.teacherId" :items="teacherOptions" :loading="loadingTeachers"
                value-key="value" label-key="label" icon="i-lucide-search"
                placeholder="Search staff…" class="w-full" :disabled="isEdit" />
            </UFormField>

            <UAlert v-if="replacesExisting" color="warning" variant="soft" icon="i-lucide-triangle-alert"
              title="This person already has a salary"
              description="Saving will replace their current salary. Use Edit Salary on their page to change it instead." />

            <div v-if="selectedTeacher" class="flex items-center gap-3 rounded-xl bg-elevated/50 p-3">
              <UAvatar size="md" :src="selectedTeacher.photo || undefined" :alt="selectedTeacher.label" />
              <div class="min-w-0">
                <p class="truncate font-semibold leading-tight">{{ selectedTeacher.label }}</p>
                <p class="truncate text-xs text-muted">{{ selectedTeacher.staffId }}</p>
              </div>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <UFormField label="Template" name="templateId" hint="Optional"
                help="Fills in the basic salary and every line below. You can still change them.">
                <USelectMenu v-model="state.templateId" :items="templateOptions" :loading="loadingTemplates"
                  value-key="value" label-key="label" icon="i-lucide-layout-template"
                  placeholder="Build from scratch" class="w-full" clear @update:model-value="onPickTemplate" />
              </UFormField>

              <UFormField label="Basic Salary" name="basicSalary" required
                help="Percentage lines are worked out from this.">
                <UInput v-model.number="state.basicSalary" type="number" min="0" placeholder="0" class="w-full">
                  <template #leading><span class="text-sm text-muted">Le</span></template>
                </UInput>
              </UFormField>
            </div>
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
        <UAlert v-if="netIsNegative" color="error" variant="soft" icon="i-lucide-circle-alert"
          title="Net pay is negative" description="Deductions are more than gross pay. Lower a deduction or raise the pay." />
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

// Active staff only (an inactive/removed teacher can't go on a payroll run). When editing, the
// person being edited is always kept so the picker still shows them.
const teacherOptions = computed(() => teachers.value
  .filter(t => !t.status || t.status === 'ACTIVE' || t.id === state.teacherId)
  .map(t => ({
  label: teacherLabel(t),
  value: t.id,
  staffId: t.staffId,
  photo: t.user?.photo
})))

// Adding a salary for someone who already has one replaces it - say so before they save.
const existingSalaryIds = ref(new Set<string>())
const replacesExisting = computed(() => !isEdit.value && existingSalaryIds.value.has(state.teacherId))
const netIsNegative = computed(() =>
  (state.basicSalary || 0) + totalAllowances.value - totalDeductions.value < 0)

const templateOptions = computed(() => templates.value.map(t => ({ label: t.name, value: t.id })))

const selectedTeacher = computed(() => teacherOptions.value.find(t => t.value === state.teacherId))

function toRows(items: PayComponent[]): PayComponentRow[] {
  return items.map(item => ({ ...item, key: crypto.randomUUID() }))
}

async function onPickTemplate(templateId: string | null) {
  if (!templateId) return

  const template = await payrollStore.fetchSalaryTemplate(templateId)
  if (!template) return

  state.basicSalary = template.basicSalary
  state.allowances = toRows(template.allowances)
  state.deductions = toRows(template.deductions)
}

const totalAllowances = computed(() => state.allowances.reduce((sum, a) => sum + resolvePayComponent(a, state.basicSalary || 0), 0))
const totalDeductions = computed(() => state.deductions.reduce((sum, d) => sum + resolvePayComponent(d, state.basicSalary || 0), 0))

function stripRow(row: PayComponentRow): PayComponent {
  const { key, resolvedAmount, ...rest } = row
  return rest
}

async function onSubmit() {
  if (netIsNegative.value) {
    notify.error("Deductions are more than gross pay - net pay can't be negative.")
    return
  }
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
      payrollStore.fetchSalaryTemplates(1, 0),
      isEdit.value ? Promise.resolve() : PayrollApi().listSalaries(1, 0, '', '', '').then((res: any) => {
        existingSalaryIds.value = new Set((res?.data || []).map((s: SalaryStructure) => s.teacher?.id).filter(Boolean))
      }).catch(() => {})
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
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
