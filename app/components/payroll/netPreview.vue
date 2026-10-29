<script setup lang="ts">
// Live net-pay summary shown beside the salary and salary-template forms.
const { basic, allowances, deductions, allowanceCount = 0, deductionCount = 0, label = 'Net Salary (preview)' } = defineProps<{
  basic: number
  allowances: number
  deductions: number
  allowanceCount?: number
  deductionCount?: number
  label?: string
}>()

const { format } = useMoney()

const safeBasic = computed(() => Number(basic) || 0)
const gross = computed(() => safeBasic.value + allowances)
const net = computed(() => gross.value - deductions)

// Share of gross pay for the split bar: what is kept from basic, from allowances, and what is deducted.
const split = computed(() => {
  const total = gross.value
  if (total <= 0) return null
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / total) * 100))}%`
  const kept = Math.max(0, net.value)
  return {
    basic: pct(Math.min(safeBasic.value, kept)),
    allowances: pct(Math.max(0, kept - safeBasic.value)),
    deductions: pct(Math.min(deductions, total)),
  }
})
</script>

<template>
  <UCard class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
    <div class="bg-primary p-6 text-inverted">
      <p class="text-sm opacity-80">{{ label }}</p>
      <p class="mt-2 font-display text-3xl font-bold md:text-4xl" :class="net < 0 && 'text-error-200'">
        {{ format(net) }}
      </p>
      <p class="mt-1 text-xs opacity-75">per month, after deductions</p>
    </div>

    <div class="space-y-4 p-4">
      <div v-if="split" class="space-y-2">
        <div class="flex h-2 overflow-hidden rounded-full bg-accented">
          <span class="bg-primary" :style="{ width: split.basic }" />
          <span class="bg-success" :style="{ width: split.allowances }" />
          <span class="bg-error" :style="{ width: split.deductions }" />
        </div>
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
          <span class="flex items-center gap-1"><span class="size-2 rounded-full bg-primary" />Basic</span>
          <span class="flex items-center gap-1"><span class="size-2 rounded-full bg-success" />Allowances</span>
          <span class="flex items-center gap-1"><span class="size-2 rounded-full bg-error" />Deductions</span>
        </div>
      </div>

      <dl class="space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-muted">Basic salary</dt>
          <dd class="font-medium">{{ format(safeBasic) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted">Allowances ({{ allowanceCount }})</dt>
          <dd class="font-medium text-success">+ {{ format(allowances) }}</dd>
        </div>
        <div class="flex justify-between border-t border-default pt-2">
          <dt class="text-muted">Gross salary</dt>
          <dd class="font-semibold">{{ format(gross) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted">Deductions ({{ deductionCount }})</dt>
          <dd class="font-medium text-error">− {{ format(deductions) }}</dd>
        </div>
        <div class="flex justify-between border-t border-default pt-2">
          <dt class="font-semibold text-highlighted">Net salary</dt>
          <dd class="font-bold text-primary">{{ format(net) }}</dd>
        </div>
      </dl>

      <UAlert v-if="net < 0" color="error" variant="soft" icon="i-lucide-triangle-alert"
        title="Deductions are more than gross pay" description="Check the deduction lines before saving." />
    </div>
  </UCard>
</template>
