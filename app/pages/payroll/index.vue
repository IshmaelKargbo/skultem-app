<template>
  <div class="space-y-4 px-4 md:px-6">

    <Heading title="Payroll" subtitle="Staff compensation, payroll runs, and payslips.">
      <UButton icon="i-lucide-play" to="/payroll/runs/new" label="Start Payroll Run" />
      <UButton variant="soft" icon="i-lucide-user-plus" to="/payroll/salaries/add" label="Add Salary" />
    </Heading>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{
        icon: 'i-lucide-users',
        label: 'Employees on Payroll',
        value: summary?.teacherCount ?? 0,
        isReady: !loadingSummary,
        color: 'primary'
      }" />
      <Metric :record="{
        icon: 'i-lucide-bar-chart-3',
        label: 'Average Salary',
        value: formatCurrency(summary?.averageSalary),
        isReady: !loadingSummary,
        color: 'info'
      }" />
      <Metric :record="{
        icon: 'i-lucide-trending-up',
        label: 'Highest Salary',
        value: formatCurrency(summary?.highestSalary),
        isReady: !loadingSummary,
        color: 'success'
      }" />
      <Metric :record="{
        icon: 'i-lucide-wallet',
        label: 'Total Gross Payroll',
        value: formatCurrency(summary?.totalGross),
        isReady: !loadingSummary,
        color: 'warning'
      }" />
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <div>
          <h3 class="font-semibold">Quick Actions</h3>
          <p class="text-sm text-muted">Frequently used actions.</p>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <NuxtLink v-for="action in quickActions" :key="action.label" :to="action.to"
          class="flex flex-col items-center gap-2 rounded-xl border border-default px-3 py-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
          <span class="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <UIcon :name="action.icon" class="size-5" />
          </span>
          <span class="text-xs font-medium leading-tight">{{ action.label }}</span>
        </NuxtLink>
      </div>
    </UCard>

    <!-- Latest run + recent salaries -->
    <div class="grid gap-4 xl:grid-cols-3">

      <UCard class="xl:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Latest Payroll Run</h3>
            <UButton to="/payroll/runs" variant="ghost" color="neutral" size="sm" label="View all" />
          </div>
        </template>

        <div v-if="loadingSummary" class="space-y-3">
          <USkeleton class="h-24 w-full rounded-xl" />
        </div>

        <div v-else-if="summary?.latestRun"
          class="flex flex-col gap-4 rounded-xl border border-default p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 class="font-semibold">{{ summary.latestRun.period }}</h4>
            <p class="text-xs text-muted">Pay date {{ formatDate(summary.latestRun.payDate) }}</p>
          </div>

          <div class="flex items-center gap-3">
            <UBadge :color="payrollRunStatusColor(summary.latestRun.status)" variant="soft">
              {{ clean(summary.latestRun.status) }}
            </UBadge>

            <UButton size="sm" variant="soft" trailing-icon="i-lucide-arrow-right"
              :to="`/payroll/runs/${summary.latestRun.id}`">
              View Run
            </UButton>
          </div>
        </div>

        <div v-else class="flex flex-col items-center gap-3 py-10 text-center">
          <UIcon name="i-lucide-play-circle" class="text-4xl text-muted" />
          <p class="text-sm text-muted">No payroll runs yet.</p>
          <UButton size="sm" icon="i-lucide-play" to="/payroll/runs/new">Start the first run</UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Recently Added</h3>
            <UButton to="/payroll/salaries" variant="ghost" color="neutral" size="sm" label="View all" />
          </div>
        </template>

        <div v-if="loadingSalaries" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-12 w-full rounded-lg" />
        </div>

        <ul v-else-if="salaries.length" class="divide-y divide-default">
          <li v-for="s in salaries" :key="s.id" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <UAvatar :src="s.teacher?.user?.photo || undefined" :alt="teacherName(s.teacher)" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ teacherName(s.teacher) }}</p>
              <p class="truncate text-xs text-muted">{{ s.teacher?.staffId }}</p>
            </div>
            <span class="shrink-0 text-xs font-semibold text-primary">{{ formatCurrency(s.netSalary) }}</span>
          </li>
        </ul>

        <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
          <UIcon name="i-lucide-wallet" class="text-3xl text-muted" />
          <p class="text-sm text-muted">No salary structures yet.</p>
        </div>
      </UCard>

    </div>

  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { summary, loadingSummary, salaries, loadingSalaries } = storeToRefs(store)

const quickActions = [
  { label: 'Add Salary', icon: 'i-lucide-user-plus', to: '/payroll/salaries/add' },
  { label: 'Start Payroll Run', icon: 'i-lucide-play', to: '/payroll/runs/new' },
  { label: 'Salary Structures', icon: 'i-lucide-wallet', to: '/payroll/salaries' },
  { label: 'Payroll Runs', icon: 'i-lucide-history', to: '/payroll/runs' },
  { label: 'Teacher Attendance', icon: ATTENDANCE_ICON, to: '/hr/teacher-attendance' },
]

function teacherName(teacher?: Teacher) {
  if (!teacher) return ''
  return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

function formatCurrency(value?: number | null) {
  return `Le ${Number(value || 0).toLocaleString()}`
}

onMounted(() => {
  useAppStore().setTitle('Payroll')
  useAppStore().setBack(false)
  document.title = 'Payroll | Skultem'

  store.fetchSummary()
  store.fetchSalaries(1, 5)
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
