<template>
  <div class="space-y-4 px-4 md:px-6">

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-24 w-full rounded-xl" />
      <USkeleton class="h-40 w-full rounded-xl" />
    </div>

    <template v-else-if="detail">

      <!-- Header -->
      <Heading title="Payroll Run" :subtitle="`${detail.run.period} · pay date ${formatDate(detail.run.payDate)}`">
        <UBadge :color="payrollRunStatusColor(detail.run.status)" variant="soft" size="lg">
          {{ clean(detail.run.status) }}
        </UBadge>

        <UButton v-if="detail.run.status === 'DRAFT'" icon="i-lucide-lock" :loading="generating"
          :disabled="detail.includedCount === 0" label="Generate Payroll" @click="generate" />

        <UButton v-else-if="detail.run.status === 'GENERATED'" icon="i-lucide-send" :loading="publishing"
          label="Publish Payslips" @click="publish" />
      </Heading>

      <UAlert v-if="detail.run.status === 'DRAFT'" color="neutral" variant="soft" icon="i-lucide-info"
        title="Generating posts to the school ledger"
        :description="`Locks in the numbers below and records a ${formatCurrency(detail.netTotal)} expense against the school's transactions - review who's included before generating.`" />

      <!-- Summary -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric :record="{ icon: 'i-lucide-users', label: 'Included Employees', value: `${detail.includedCount} / ${detail.totalCount}`, isReady: true, color: 'primary' }" />
        <Metric :record="{ icon: 'i-lucide-wallet', label: 'Gross Payroll', value: formatCurrency(detail.grossTotal), isReady: true, color: 'info' }" />
        <Metric :record="{ icon: 'i-lucide-circle-minus', label: 'Deductions', value: formatCurrency(detail.deductionTotal), isReady: true, color: 'error' }" />
        <Metric :record="{ icon: 'i-lucide-banknote', label: 'Net Payroll', value: formatCurrency(detail.netTotal), isReady: true, color: 'success' }" />
      </div>

      <!-- Employees -->
      <h3 class="font-semibold">Employees in this run</h3>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard v-for="slip in detail.payslips" :key="slip.id" class="transition-opacity"
          :class="{ 'opacity-50': !slip.included }">
          <div class="space-y-4">

            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <UAvatar size="lg" :src="slip.teacher?.user?.photo || undefined" :alt="teacherName(slip.teacher)" />
                <div>
                  <h3 class="font-semibold leading-tight">{{ teacherName(slip.teacher) }}</h3>
                  <p class="text-xs text-muted">{{ slip.teacher?.staffId }}</p>
                </div>
              </div>

              <USwitch :model-value="slip.included" :disabled="detail.run.status !== 'DRAFT'"
                @update:model-value="(val: boolean) => toggle(slip, val)" />
            </div>

            <div class="space-y-2 rounded-xl bg-elevated/50 p-4 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted">Basic Salary</span>
                <span class="font-medium">{{ formatCurrency(slip.basicSalary) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted">Allowances</span>
                <span class="font-medium text-success">+ {{ formatCurrency(slip.allowances) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted">Deductions</span>
                <span class="font-medium text-error">- {{ formatCurrency(slip.deductions) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 rounded-xl bg-primary p-4 text-inverted">
              <div>
                <p class="text-xs opacity-80">Net Salary</p>
                <p class="text-xl font-bold">{{ formatCurrency(slip.netSalary) }}</p>
              </div>

              <UButton size="sm" variant="ghost" color="neutral" trailing-icon="i-lucide-arrow-right"
                class="text-inverted hover:bg-white/10" :to="`/payroll/runs/${detail.run.id}/payslip/${slip.teacher.id}`">
                Details
              </UButton>
            </div>

            <p v-if="!slip.included" class="flex items-center gap-1.5 text-xs text-muted">
              <UIcon name="i-lucide-circle-slash" class="size-3.5" />
              Excluded from this payroll run
            </p>

          </div>
        </UCard>
      </div>

    </template>

    <UCard v-else class="py-16">
      <div class="text-center">
        <UIcon name="i-lucide-file-x" class="mx-auto text-5xl text-muted" />
        <h3 class="mt-4 text-lg font-semibold">Payroll run not found</h3>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const notify = useNotify()
const store = usePayrollStore()
const { currentRun: detail, loadingRun: loading } = storeToRefs(store)

const generating = ref(false)
const publishing = ref(false)

function teacherName(teacher?: Teacher) {
  if (!teacher) return ''
  return `${teacher.user?.givenNames || ''} ${teacher.user?.familyName || ''}`.trim()
}

function formatCurrency(value?: number | null) {
  return `Le ${Number(value || 0).toLocaleString()}`
}

async function toggle(slip: Payslip, included: boolean) {
  try {
    await store.setIncluded(detail.value!.run.id, slip.id, included)
  } catch (err: any) {
    notify.error(err?.message || 'Unable to update employee.')
  }
}

async function generate() {
  generating.value = true
  try {
    await store.generateRun(detail.value!.run.id)
    notify.success('Payroll generated.')
  } catch (err: any) {
    notify.error(err?.message || 'Unable to generate payroll.')
  } finally {
    generating.value = false
  }
}

async function publish() {
  publishing.value = true
  try {
    await store.publishRun(detail.value!.run.id)
    notify.success('Payslips published.')
  } catch (err: any) {
    notify.error(err?.message || 'Unable to publish payslips.')
  } finally {
    publishing.value = false
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
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
