<template>
  <div class="space-y-3 px-4 md:px-6">

    <Heading :title="teacherName || 'Salary Details'" subtitle="Compensation package and payslip history.">
      <UButton v-if="salary" icon="i-lucide-pencil" :to="`/payroll/salaries/add?teacherId=${salary.teacher.id}`"
        label="Edit Salary" />
    </Heading>

    <div v-if="loading" class="space-y-3">
      <USkeleton class="h-36 w-full rounded-xl" />
      <div class="grid gap-4 md:grid-cols-2">
        <USkeleton class="h-48 w-full rounded-xl" />
        <USkeleton class="h-48 w-full rounded-xl" />
      </div>
      <USkeleton class="h-40 w-full rounded-xl" />
    </div>

    <template v-else-if="salary">

      <!-- Profile + pay at a glance -->
      <UCard>
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-4">
            <UAvatar size="2xl" :src="salary.teacher?.user?.photo || undefined" :alt="teacherName" loading="lazy" />
            <div class="min-w-0 space-y-1">
              <h2 class="truncate text-lg font-bold">{{ teacherName }}</h2>
              <p class="text-sm text-muted">{{ salary.teacher.staffId }}</p>
              <UBadge v-if="salary.templateName" variant="subtle" color="neutral" size="sm"
                icon="i-lucide-layout-template">{{ salary.templateName }}</UBadge>
              <UBadge v-else variant="subtle" color="neutral" size="sm" icon="i-lucide-pencil-ruler">Custom package</UBadge>
            </div>
          </div>

          <dl class="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[28rem]">
            <div class="rounded-xl border border-default p-3">
              <dt class="text-[11px] uppercase tracking-wide text-muted">Basic</dt>
              <dd class="mt-1 truncate font-semibold sm:text-lg">{{ formatCurrency(salary.basicSalary) }}</dd>
            </div>
            <div class="rounded-xl border border-default p-3">
              <dt class="text-[11px] uppercase tracking-wide text-muted">Gross</dt>
              <dd class="mt-1 truncate font-semibold sm:text-lg">{{ formatCurrency(salary.grossSalary) }}</dd>
            </div>
            <div class="rounded-xl bg-primary p-3 text-inverted">
              <dt class="text-[11px] uppercase tracking-wide opacity-80">Net / month</dt>
              <dd class="mt-1 truncate font-bold sm:text-lg">{{ formatCurrency(salary.netSalary) }}</dd>
            </div>
          </dl>
        </div>
      </UCard>

      <!-- Breakdown -->
      <div class="grid gap-4 md:grid-cols-2">
        <UCard v-for="group in breakdown" :key="group.title">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="h-4 w-1 rounded-full" :class="group.bar" />
                <span class="font-semibold">{{ group.title }}</span>
              </div>
              <span class="text-sm font-semibold" :class="group.text">{{ group.sign }} {{ formatCurrency(group.total) }}</span>
            </div>
          </template>

          <ul v-if="group.items.length" class="divide-y divide-default">
            <li v-for="item in group.items" :key="item.name" class="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted">{{ item.name }}</p>
                <p class="text-xs text-muted">{{ item.type === 'PERCENTAGE' ? `${item.value}% of basic` : 'Fixed amount' }}</p>
              </div>
              <span class="shrink-0 font-semibold" :class="group.text">
                {{ group.sign }} {{ formatCurrency(item.resolvedAmount ?? item.value) }}
              </span>
            </li>
          </ul>
          <p v-else class="py-4 text-center text-sm text-muted">No {{ group.title.toLowerCase() }}.</p>
        </UCard>
      </div>

      <!-- Payslip history -->
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div>
            <p class="font-semibold">Payslip history</p>
            <p class="text-xs text-muted">Every payroll run this person was part of.</p>
          </div>
        </template>

        <div v-if="history.length" class="divide-y divide-default">
          <NuxtLink v-for="slip in history" :key="slip.id"
            :to="`/payroll/runs/${slip.payrollRunId}/payslip/${salary.teacher.id}`"
            class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
            <div class="flex min-w-0 items-center gap-3">
              <UBadge :color="slip.included ? 'primary' : 'neutral'" variant="soft" icon="i-lucide-receipt"
                size="lg" square class="shrink-0 rounded-lg" />
              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted">{{ slip.payrollRunPeriod || 'Payroll Run' }}</p>
                <p class="truncate text-xs text-muted">{{ formatDate(slip.createdAt) }}</p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-3">
              <div class="text-right">
                <p class="font-semibold" :class="!slip.included && 'text-muted line-through'">{{ formatCurrency(slip.netSalary) }}</p>
                <p class="text-[11px] text-muted">{{ slip.included ? 'Paid' : 'Excluded' }}</p>
              </div>
              <UIcon name="i-lucide-chevron-right" class="hidden size-4 text-dimmed sm:block" />
            </div>
          </NuxtLink>
        </div>

        <div v-else class="flex flex-col items-center gap-2 py-10 text-center">
          <UIcon name="i-lucide-receipt" class="text-3xl text-muted" />
          <p class="text-sm text-muted">No payslips yet. They'll appear after the next payroll run.</p>
        </div>
      </UCard>

    </template>

    <UCard v-else class="py-16">
      <div class="flex flex-col items-center gap-3 text-center">
        <UIcon name="i-lucide-user-x" class="text-5xl text-muted" />
        <h3 class="text-lg font-semibold">No salary structure found</h3>
        <UButton to="/payroll/salaries/add" icon="i-lucide-plus" variant="soft" label="Add Salary" />
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const store = usePayrollStore()
const { currentSalary: salary, salaryHistory: history, loadingSalary: loading } = storeToRefs(store)

const teacherName = computed(() => {
  const t = salary.value?.teacher
  if (!t) return ''
  return `${t.user?.givenNames || ''} ${t.user?.familyName || ''}`.trim()
})

const breakdown = computed(() => {
  const s = salary.value
  if (!s) return []
  return [
    { title: 'Allowances', items: s.allowances, total: s.totalAllowances, sign: '+', text: 'text-success', bar: 'bg-success' },
    { title: 'Deductions', items: s.deductions, total: s.totalDeductions, sign: '−', text: 'text-error', bar: 'bg-error' },
  ]
})

const { format } = useMoney()

function formatCurrency(value?: number | null) {
  return format(value || 0)
}

watch(
  () => route.params.id,
  async (teacherId) => {
    if (!teacherId) return
    await store.fetchSalaryByTeacher(teacherId as string)

    useAppStore().setTitle('Salary Details')
    useAppStore().setBack('/payroll/salaries')
    document.title = `${teacherName.value || 'Salary'} | Payroll | Skultem`
  },
  { immediate: true }
)

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
