<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Payroll History" subtitle="Your past payslips." />

    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-history" class="text-primary" />
          <span class="font-semibold">Payslips</span>
        </div>
      </template>

      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-xl" />
      </div>

      <div v-else-if="history.length" class="space-y-3">
        <NuxtLink v-for="slip in history" :key="slip.id" :to="`/payroll/history/${slip.payrollRunId}`"
          class="flex items-center justify-between rounded-xl border border-default p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
          <div>
            <h3 class="font-medium">{{ slip.payrollRunPeriod || 'Payroll Run' }}</h3>
            <p class="text-xs text-muted">{{ formatDate(slip.createdAt) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <p class="font-semibold">{{ formatCurrency(slip.netSalary) }}</p>
            <UIcon name="i-lucide-chevron-right" class="text-muted" />
          </div>
        </NuxtLink>
      </div>

      <div v-else class="flex flex-col items-center gap-2 py-16 text-center">
        <UIcon name="i-lucide-history" class="text-3xl text-muted" />
        <p class="text-sm font-semibold text-highlighted">No payslips yet</p>
        <p class="max-w-xs text-xs text-muted">Once your school publishes a payroll run you're on, it'll show up here.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const store = usePayrollStore()
const { salaryHistory: history, loadingSalary: loading } = storeToRefs(store)

function formatCurrency(value?: number | null) {
  return `Le ${Number(value || 0).toLocaleString()}`
}

onMounted(async () => {
  useAppStore().setTitle('Payroll History')
  useAppStore().setBack('/')
  document.title = 'Payroll History | Skultem'

  await store.fetchMySalaryHistory()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.TEACHER]
})
</script>
