<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Salary Details" subtitle="View teacher compensation and payroll history.">
      <UButton v-if="salary" icon="i-lucide-pencil" variant="soft" :to="`/payroll/salaries/add?teacherId=${salary.teacher.id}`" label="Edit Salary" />
    </Heading>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-24 w-full rounded-xl" />
      <USkeleton class="h-40 w-full rounded-xl" />
    </div>

    <template v-else-if="salary">
      <div class="grid gap-4 lg:grid-cols-3">

        <!-- Left -->
        <div class="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <UCard class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
            <div class="bg-primary p-6 text-center text-inverted">
              <p class="text-sm opacity-80">Net Salary</p>
              <h1 class="mt-3 text-4xl font-bold">{{ formatCurrency(salary.netSalary) }}</h1>
              <p class="mt-2 text-xs opacity-75">
                {{ formatCurrency(salary.grossSalary) }} gross − {{ formatCurrency(salary.totalDeductions) }} deductions
              </p>
            </div>
          </UCard>

          <UCard v-if="salary.templateName">
            <div class="flex items-center gap-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UIcon name="i-lucide-layout-template" class="size-4" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted">Built from template</p>
                <p class="truncate text-sm font-medium text-highlighted">{{ salary.templateName }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right -->
        <div class="space-y-4 lg:col-span-2">

          <UCard>
            <div class="flex items-center gap-4">
              <UAvatar size="2xl" :src="salary.teacher?.user?.photo || undefined" :alt="teacherName" loading="lazy" />
              <div class="flex w-full items-center justify-between">
                <div>
                  <h2 class="text-lg font-bold">{{ teacherName }}</h2>
                  <p class="text-sm text-muted">{{ salary.teacher.staffId }}</p>
                </div>
                <UBadge variant="soft" color="success" icon="i-lucide-circle-check">Active</UBadge>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-wallet" class="text-primary" />
                <span class="font-semibold">Compensation Package</span>
              </div>
            </template>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-xl border border-default p-5">
                <p class="text-xs text-muted">Basic Salary</p>
                <h3 class="mt-2 text-2xl font-bold">{{ formatCurrency(salary.basicSalary) }}</h3>
              </div>
              <div class="rounded-xl border border-default p-5">
                <p class="text-xs text-muted">Gross Salary</p>
                <h3 class="mt-2 text-2xl font-bold">{{ formatCurrency(salary.grossSalary) }}</h3>
                <p class="mt-1 text-xs text-muted">Basic + allowances</p>
              </div>
            </div>
          </UCard>

          <div class="grid gap-4 md:grid-cols-2">
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-circle-plus" class="text-success" />
                  <span class="font-semibold">Allowances</span>
                </div>
              </template>

              <div v-if="salary.allowances.length" class="space-y-2">
                <div v-for="a in salary.allowances" :key="a.name" class="flex items-center justify-between text-sm">
                  <div class="min-w-0">
                    <p class="truncate font-medium text-highlighted">{{ a.name }}</p>
                    <p class="text-xs text-muted">{{ a.type === 'PERCENTAGE' ? `${a.value}% of basic` : 'Fixed' }}</p>
                  </div>
                  <span class="shrink-0 font-semibold text-success">+ {{ formatCurrency(a.resolvedAmount ?? a.value) }}</span>
                </div>
                <div class="flex items-center justify-between border-t border-default pt-2 text-sm font-semibold">
                  <span>Total</span>
                  <span class="text-success">+ {{ formatCurrency(salary.totalAllowances) }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-muted">No allowances.</p>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-circle-minus" class="text-error" />
                  <span class="font-semibold">Deductions</span>
                </div>
              </template>

              <div v-if="salary.deductions.length" class="space-y-2">
                <div v-for="d in salary.deductions" :key="d.name" class="flex items-center justify-between text-sm">
                  <div class="min-w-0">
                    <p class="truncate font-medium text-highlighted">{{ d.name }}</p>
                    <p class="text-xs text-muted">{{ d.type === 'PERCENTAGE' ? `${d.value}% of basic` : 'Fixed' }}</p>
                  </div>
                  <span class="shrink-0 font-semibold text-error">- {{ formatCurrency(d.resolvedAmount ?? d.value) }}</span>
                </div>
                <div class="flex items-center justify-between border-t border-default pt-2 text-sm font-semibold">
                  <span>Total</span>
                  <span class="text-error">- {{ formatCurrency(salary.totalDeductions) }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-muted">No deductions.</p>
            </UCard>
          </div>

          <!-- Payslip history -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-history" class="text-primary" />
                <span class="font-semibold">Payslip History</span>
              </div>
            </template>

            <div v-if="history.length" class="space-y-3">
              <div v-for="slip in history" :key="slip.id"
                class="flex items-center justify-between rounded-xl border border-default p-4">
                <div>
                  <h3 class="font-medium">{{ slip.payrollRunPeriod || 'Payroll Run' }}</h3>
                  <p class="text-xs text-muted">{{ formatDate(slip.createdAt) }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold">{{ formatCurrency(slip.netSalary) }}</p>
                  <UBadge :color="slip.included ? 'success' : 'neutral'" variant="soft">
                    {{ slip.included ? 'Included' : 'Excluded' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
              <UIcon name="i-lucide-history" class="text-3xl text-muted" />
              <p class="text-sm text-muted">No payslips yet — this teacher will appear on the next payroll run.</p>
            </div>
          </UCard>

        </div>

      </div>
    </template>

    <UCard v-else class="py-16">
      <div class="text-center">
        <UIcon name="i-lucide-user-x" class="mx-auto text-5xl text-muted" />
        <h3 class="mt-4 text-lg font-semibold">No salary structure found</h3>
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

function formatCurrency(value?: number | null) {
  return `Le ${Number(value || 0).toLocaleString()}`
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
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
