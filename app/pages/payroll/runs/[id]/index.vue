<template>
  <div class="space-y-3 px-4 md:px-6">

    <div v-if="loading" class="space-y-3">
      <USkeleton class="h-20 w-full rounded-xl" />
      <USkeleton class="h-16 w-full rounded-xl" />
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <USkeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-xl" />
      </div>
      <USkeleton class="h-72 w-full rounded-xl" />
    </div>

    <template v-else-if="detail">

      <!-- Header -->
      <Heading :title="detail.run.period" :subtitle="`Pay date ${formatDate(detail.run.payDate)}`">
        <UBadge :color="payrollRunStatusColor(detail.run.status)" variant="soft" size="lg" class="self-start md:self-auto">
          {{ clean(detail.run.status) }}
        </UBadge>

        <UButton v-if="isDraft" icon="i-lucide-lock" :disabled="totals.count === 0" label="Generate Payroll"
          @click="askConfirm('generate')" />

        <UButton v-else-if="detail.run.status === 'GENERATED'" icon="i-lucide-send" label="Publish Payslips"
          @click="askConfirm('publish')" />
      </Heading>

      <!-- Progress -->
      <UCard :ui="{ body: 'p-4 sm:p-4' }">
        <PayrollRunProgress :status="detail.run.status" />
      </UCard>

      <UAlert v-if="isDraft" color="neutral" variant="soft" icon="i-lucide-info"
        title="Review before generating"
        description="Switch off anyone who shouldn't be paid this period. Generating locks these numbers and records the net total as an expense in the school ledger." />

      <!-- Summary (follows the include/exclude switches live) -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric :record="{ icon: 'i-lucide-users', label: 'Included Employees', value: `${totals.count} / ${detail.payslips.length}`, isReady: true, color: 'primary' }" />
        <Metric :record="{ icon: 'i-lucide-wallet', label: 'Gross Payroll', value: formatCurrency(totals.gross), isReady: true, color: 'info' }" />
        <Metric :record="{ icon: 'i-lucide-circle-minus', label: 'Deductions', value: formatCurrency(totals.deductions), isReady: true, color: 'error' }" />
        <Metric :record="{ icon: 'i-lucide-banknote', label: 'Net Payroll', value: formatCurrency(totals.net), isReady: true, color: 'success' }" />
      </div>

      <!-- Employees -->
      <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-4 sm:px-4' }">
        <template #header>
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="font-semibold">Employees in this run</p>
              <p class="text-xs text-muted">
                {{ isDraft ? 'Use the switch to include or exclude someone.' : 'Included employees are locked for this run.' }}
              </p>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <UInput v-model="search" icon="i-lucide-search" placeholder="Search name or staff ID..." class="sm:w-64" />
              <UTabs v-model="filter" :items="filterTabs" :content="false" size="xs" class="w-full sm:w-auto" />
            </div>
          </div>
        </template>

        <!-- Desktop table -->
        <UTable class="hidden md:block" :columns="columns" :data="rows">
          <template #empty>
            <div class="flex flex-col items-center gap-2 py-10">
              <UIcon name="i-lucide-search-x" class="text-4xl text-muted" />
              <p class="text-sm text-muted">No employees match.</p>
            </div>
          </template>
          <template #employee-cell="{ row }">
            <div class="flex items-center gap-3" :class="!row.original.included && 'opacity-50'">
              <UAvatar size="sm" :src="row.original.teacher?.user?.photo || undefined"
                :alt="teacherName(row.original.teacher)" loading="lazy" />
              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted">{{ teacherName(row.original.teacher) }}</p>
                <p class="truncate text-xs text-muted">{{ row.original.teacher?.staffId }}</p>
              </div>
            </div>
          </template>
          <template #basicSalary-cell="{ row }">
            <span :class="!row.original.included && 'opacity-50'">{{ formatCurrency(row.original.basicSalary) }}</span>
          </template>
          <template #allowances-cell="{ row }">
            <span class="text-success" :class="!row.original.included && 'opacity-50'">+ {{ formatCurrency(row.original.allowances) }}</span>
          </template>
          <template #deductions-cell="{ row }">
            <span class="text-error" :class="!row.original.included && 'opacity-50'">− {{ formatCurrency(row.original.deductions) }}</span>
          </template>
          <template #netSalary-cell="{ row }">
            <span class="font-semibold text-highlighted" :class="!row.original.included && 'line-through opacity-50'">
              {{ formatCurrency(row.original.netSalary) }}
            </span>
          </template>
          <template #included-cell="{ row }">
            <div class="flex justify-center">
              <USwitch :model-value="row.original.included" :disabled="!isDraft || toggling.has(row.original.id)"
                :loading="toggling.has(row.original.id)" :aria-label="`Include ${teacherName(row.original.teacher)}`"
                @update:model-value="(val: boolean) => toggle(row.original, val)" />
            </div>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <UButton size="xs" variant="ghost" color="neutral" trailing-icon="i-lucide-arrow-right" label="Payslip"
                :to="`/payroll/runs/${detail.run.id}/payslip/${row.original.teacher.id}`" />
            </div>
          </template>
        </UTable>

        <!-- Mobile list -->
        <div class="md:hidden">
          <div v-for="slip in rows" :key="slip.id"
            class="flex items-center gap-3 border-b border-default px-4 py-3 last:border-0">
            <NuxtLink :to="`/payroll/runs/${detail.run.id}/payslip/${slip.teacher.id}`"
              class="flex min-w-0 flex-1 items-center gap-3" :class="!slip.included && 'opacity-50'">
              <UAvatar size="sm" :src="slip.teacher?.user?.photo || undefined" :alt="teacherName(slip.teacher)" loading="lazy" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-highlighted">{{ teacherName(slip.teacher) }}</p>
                <p class="truncate text-xs text-muted">{{ slip.teacher?.staffId }}</p>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-sm font-bold" :class="slip.included ? 'text-highlighted' : 'line-through'">
                  {{ formatCurrency(slip.netSalary) }}
                </p>
                <p class="text-[11px] text-muted">net</p>
              </div>
            </NuxtLink>
            <USwitch :model-value="slip.included" :disabled="!isDraft || toggling.has(slip.id)"
              :loading="toggling.has(slip.id)" :aria-label="`Include ${teacherName(slip.teacher)}`"
              @update:model-value="(val: boolean) => toggle(slip, val)" />
          </div>
          <div v-if="!rows.length" class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-search-x" class="text-4xl text-muted" />
            <p class="text-sm text-muted">No employees match.</p>
          </div>
        </div>

        <!-- Totals -->
        <div v-if="detail.payslips.length"
          class="flex flex-col gap-1 border-t border-default bg-elevated/50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span class="text-muted">{{ totals.count }} of {{ detail.payslips.length }} employees included</span>
          <span class="font-semibold text-highlighted">Net total {{ formatCurrency(totals.net) }}</span>
        </div>
      </UCard>

    </template>

    <UCard v-else class="py-16">
      <div class="flex flex-col items-center gap-3 text-center">
        <UIcon name="i-lucide-file-x" class="text-5xl text-muted" />
        <h3 class="text-lg font-semibold">Payroll run not found</h3>
        <UButton to="/payroll/runs" variant="soft" icon="i-lucide-arrow-left" label="Back to payroll runs" />
      </div>
    </UCard>

    <!-- Confirm generate / publish -->
    <UModal v-model:open="confirmOpen">
      <template #content>
        <UCard v-if="detail">
          <template #header>
            <h3 class="text-lg font-semibold">
              {{ confirmAction === 'generate' ? 'Generate payroll?' : 'Publish payslips?' }}
            </h3>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3 rounded-xl bg-elevated/50 p-4 text-sm">
              <div>
                <p class="text-xs text-muted">Period</p>
                <p class="font-semibold">{{ detail.run.period }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">Employees</p>
                <p class="font-semibold">{{ totals.count }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">Pay date</p>
                <p class="font-semibold">{{ formatDate(detail.run.payDate) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">Net total</p>
                <p class="font-semibold">{{ formatCurrency(totals.net) }}</p>
              </div>
            </div>

            <UAlert v-if="confirmAction === 'generate'" color="warning" variant="soft" icon="i-lucide-lock"
              title="This can't be undone"
              :description="`The numbers above will be locked and ${formatCurrency(totals.net)} will be recorded as an expense in the school ledger.`" />
            <UAlert v-else color="info" variant="soft" icon="i-lucide-send"
              title="Staff will see their payslips"
              description="Every included employee will be able to view and download their payslip for this period." />
          </div>

          <template #footer>
            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <UButton label="Cancel" variant="soft" color="neutral" :disabled="busy" @click="askConfirm(null)" />
              <UButton v-if="confirmAction === 'generate'" icon="i-lucide-lock" label="Generate Payroll" :loading="busy"
                @click="generate" />
              <UButton v-else icon="i-lucide-send" label="Publish Payslips" :loading="busy" @click="publish" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const notify = useNotify()
const store = usePayrollStore()
const { currentRun: detail, loadingRun: loading } = storeToRefs(store)

const busy = ref(false)
const confirmAction = ref<'generate' | 'publish' | null>(null)
const confirmOpen = computed({
  get: () => confirmAction.value !== null,
  set: (open: boolean) => { if (!open && !busy.value) confirmAction.value = null }
})

function askConfirm(action: 'generate' | 'publish' | null) {
  confirmAction.value = action
}

const isDraft = computed(() => detail.value?.run.status === 'DRAFT')

// Worked out from the payslips so the numbers move as soon as someone is switched in or out.
const totals = computed(() => {
  const included = (detail.value?.payslips ?? []).filter(p => p.included)
  const sum = (key: 'grossSalary' | 'deductions' | 'netSalary') => included.reduce((t, p) => t + (p[key] || 0), 0)
  return { count: included.length, gross: sum('grossSalary'), deductions: sum('deductions'), net: sum('netSalary') }
})

const search = ref('')
const filter = ref<'all' | 'included' | 'excluded'>('all')

const filterTabs = computed(() => {
  const all = detail.value?.payslips.length ?? 0
  return [
    { label: `All (${all})`, value: 'all' },
    { label: `Included (${totals.value.count})`, value: 'included' },
    { label: `Excluded (${all - totals.value.count})`, value: 'excluded' },
  ]
})

const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (detail.value?.payslips ?? []).filter((p) => {
    if (filter.value === 'included' && !p.included) return false
    if (filter.value === 'excluded' && p.included) return false
    if (!q) return true
    return teacherName(p.teacher).toLowerCase().includes(q) || (p.teacher?.staffId || '').toLowerCase().includes(q)
  })
})

const right = { class: { th: 'text-right', td: 'text-right' } }
const columns = [
  { id: 'employee', header: 'Employee' },
  { accessorKey: 'basicSalary', header: 'Basic', meta: right },
  { accessorKey: 'allowances', header: 'Allowances', meta: right },
  { accessorKey: 'deductions', header: 'Deductions', meta: right },
  { accessorKey: 'netSalary', header: 'Net Salary', meta: right },
  { accessorKey: 'included', header: 'Include', meta: { class: { th: 'text-center', td: 'text-center' } } },
  { id: 'actions', header: '' },
]

const toggling = ref(new Set<string>())

function teacherName(teacher?: Teacher) {
  if (!teacher) return ''
  return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

const { format } = useMoney()

function formatCurrency(value?: number | null) {
  return format(value || 0)
}

async function toggle(slip: Payslip, included: boolean) {
  toggling.value.add(slip.id)
  try {
    await store.setIncluded(detail.value!.run.id, slip.id, included)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to update employee.')
  } finally {
    toggling.value.delete(slip.id)
  }
}

async function generate() {
  busy.value = true
  try {
    await store.generateRun(detail.value!.run.id)
    notify.success('Payroll generated.')
    confirmAction.value = null
  } catch (err: any) {
    notify.error(err?.message || 'Unable to generate payroll.')
  } finally {
    busy.value = false
  }
}

async function publish() {
  busy.value = true
  try {
    await store.publishRun(detail.value!.run.id)
    notify.success('Payslips published.')
    confirmAction.value = null
  } catch (err: any) {
    notify.error(err?.message || 'Unable to publish payslips.')
  } finally {
    busy.value = false
  }
}

watch(
  () => route.params.id,
  async (id) => {
    if (!id) return
    await store.fetchRun(id as string)

    useAppStore().setTitle('Payroll Run')
    useAppStore().setBack('/payroll/runs')
    document.title = `${detail.value?.run.period || 'Payroll Run'} | Payroll | Skultem`
  },
  { immediate: true }
)

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
