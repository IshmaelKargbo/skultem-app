<template>
  <div class="space-y-3 px-4 md:px-6">
    <Heading title="My Payslips" subtitle="Your published payslips, newest first." />

    <PayrollSectionNav />

    <div v-if="loading" class="space-y-3">
      <USkeleton class="h-32 w-full rounded-xl" />
      <USkeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-xl" />
    </div>

    <template v-else-if="history.length">

      <!-- Latest payslip -->
      <NuxtLink v-if="latest" :to="`/payroll/history/${latest.payrollRunId}`"
        class="group block overflow-hidden rounded-xl bg-primary text-inverted shadow-sm">
        <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide opacity-80">Latest payslip · {{ latest.payrollRunPeriod || 'Payroll Run' }}</p>
            <p class="mt-1 font-display text-3xl font-bold">{{ formatCurrency(latest.netSalary) }}</p>
            <p class="mt-1 text-xs opacity-80">
              {{ formatCurrency(latest.grossSalary) }} gross − {{ formatCurrency(latest.deductions) }} deductions
            </p>
          </div>
          <span class="inline-flex items-center gap-1.5 self-start rounded-lg bg-white/15 px-3 py-2 text-sm font-medium transition-colors group-hover:bg-white/25 sm:self-auto">
            View payslip
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </span>
        </div>
      </NuxtLink>

      <!-- All payslips -->
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <p class="font-semibold">All payslips</p>
        </template>

        <div class="divide-y divide-default">
          <NuxtLink v-for="slip in history" :key="slip.id" :to="`/payroll/history/${slip.payrollRunId}`"
            class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
            <div class="flex min-w-0 items-center gap-3">
              <UBadge variant="soft" icon="i-lucide-receipt" size="lg" square class="shrink-0 rounded-lg" />
              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted">{{ slip.payrollRunPeriod || 'Payroll Run' }}</p>
                <p class="truncate text-xs text-muted">{{ formatDate(slip.createdAt) }}</p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-3">
              <div class="text-right">
                <p class="font-semibold">{{ formatCurrency(slip.netSalary) }}</p>
                <p class="hidden text-[11px] text-muted sm:block">Gross {{ formatCurrency(slip.grossSalary) }}</p>
              </div>
              <UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed" />
            </div>
          </NuxtLink>
        </div>
      </UCard>
    </template>

    <UCard v-else>
      <div class="flex flex-col items-center gap-2 py-16 text-center">
        <UIcon name="i-lucide-receipt" class="text-3xl text-muted" />
        <p class="text-sm font-semibold text-highlighted">No payslips yet</p>
        <p class="max-w-xs text-xs text-muted">Once your school publishes a payroll run you're on, it'll show up here.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { salaryHistory: history, loadingSalary: loading } = storeToRefs(store)

const latest = computed(() => history.value[0])

const { format } = useMoney()

function formatCurrency(value?: number | null) {
  return format(value || 0)
}

onMounted(async () => {
  useAppStore().setTitle('My Payslips')
  useAppStore().setBack('/')
  document.title = 'My Payslips | Skultem'

  await store.fetchMySalaryHistory()
})

definePageMeta({
  role: [Role.ADMIN, Role.ACCOUNTANT, Role.OWNER, Role.PROPRIETOR, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
