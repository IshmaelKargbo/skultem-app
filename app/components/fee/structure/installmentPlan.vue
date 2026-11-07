<!-- The installment plan for a fee: two or more parts (name, amount, due date) adding up to the fee. -->
<template>
  <div class="space-y-3 rounded-xl border border-default p-3">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p class="font-medium">Installment plan</p>
        <p class="text-xs text-muted">
          Optional. Set when each part is due - a student is only overdue once a part's date has passed unpaid.
          Without a plan, any part payment is accepted before the due date.
        </p>
      </div>
      <UButton v-if="modelValue.length" size="xs" variant="ghost" color="neutral" label="Remove plan"
        :disabled="disabled" @click="emit('update:modelValue', [])" />
    </div>

    <!-- Quick starts -->
    <div class="flex flex-wrap gap-1.5">
      <UButton size="xs" variant="soft" color="neutral" icon="i-lucide-split" label="2 parts" :disabled="!canSplit"
        @click="splitEqually(2)" />
      <UButton size="xs" variant="soft" color="neutral" icon="i-lucide-split" label="3 parts" :disabled="!canSplit"
        @click="splitEqually(3)" />
      <UButton size="xs" variant="soft" color="neutral" icon="i-lucide-calendar-range" label="Monthly"
        :disabled="!canSplit || months.length < 2" @click="splitMonthly" />
      <UButton v-if="yearTerms.length > 1" size="xs" variant="soft" color="neutral" icon="i-lucide-calendar-days"
        label="One per term" :disabled="!amount || disabled" @click="splitByTerm" />
    </div>
    <p v-if="!amount" class="text-xs text-muted">Enter the fee amount first.</p>

    <div v-if="modelValue.length" class="space-y-2">
      <div v-for="(row, i) in modelValue" :key="i"
        class="grid grid-cols-[1fr_auto] gap-2 rounded-lg bg-elevated/40 p-2 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center">
        <UInput :model-value="row.label" :placeholder="`${ordinal(i + 1)} installment`" size="sm" :disabled="disabled"
          class="col-span-1" @update:model-value="(v) => update(i, { label: String(v) })" />
        <UButton icon="i-lucide-x" size="xs" variant="ghost" color="neutral" aria-label="Remove part"
          class="justify-self-end sm:order-last" :disabled="disabled" @click="remove(i)" />
        <UInput :model-value="row.amount ?? undefined" type="number" min="0" step="0.01" size="sm" placeholder="Amount"
          :disabled="disabled" @update:model-value="(v) => update(i, { amount: toAmount(v) })" />
        <UInput :model-value="row.dueDate" type="date" size="sm" :disabled="disabled"
          @update:model-value="(v) => update(i, { dueDate: String(v) })" />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <UButton size="xs" variant="link" color="primary" icon="i-lucide-plus" label="Add part" class="px-0"
          :disabled="disabled" @click="add" />
        <p class="text-xs" :class="balanced ? 'text-success' : 'text-warning'">
          <UIcon :name="balanced ? 'i-lucide-circle-check' : 'i-lucide-triangle-alert'" class="-mt-0.5 size-3.5" />
          {{ format(total) }} of {{ format(amount || 0) }}
          <template v-if="!balanced">
            · {{ difference > 0 ? `${format(difference)} still to place` : `${format(-difference)} too much` }}
          </template>
        </p>
      </div>
      <p v-if="outOfOrder" class="text-xs text-warning">Put the parts in due-date order.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { modelValue, amount, termStart, termEnd, yearTerms = [], disabled = false } = defineProps<{
  modelValue: InstallmentRow[]
  amount: number | null
  // The fee's term - equal splits and monthly parts are spread across it.
  termStart?: string | null
  termEnd?: string | null
  // Every term of the year, for "one per term" (e.g. a yearly fee paid termly).
  yearTerms?: { name: string, endDate: string, termNumber?: number }[]
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [InstallmentRow[]] }>()

const { format } = useMoney()

const canSplit = computed(() => !!amount && !!termStart && !!termEnd && !disabled)
const total = computed(() => round(modelValue.reduce((n, r) => n + (Number(r.amount) || 0), 0)))
const difference = computed(() => round((amount || 0) - total.value))
const balanced = computed(() => Math.abs(difference.value) < 0.005)
const outOfOrder = computed(() => modelValue.some((r, i) => i > 0 && r.dueDate && modelValue[i - 1]!.dueDate
  && r.dueDate < modelValue[i - 1]!.dueDate))

// The last day of each month the term runs through, ending on the term's last day.
const months = computed(() => {
  if (!termStart || !termEnd) return [] as string[]
  const out: string[] = []
  const end = new Date(`${termEnd}T00:00:00`)
  let cursor = new Date(`${termStart}T00:00:00`)
  while (cursor <= end) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
    out.push(iso(monthEnd < end ? monthEnd : end))
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }
  return out
})

// An emptied number field comes back as '' - that's no amount yet, not zero.
function toAmount(value: unknown) {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function round(n: number) {
  return Math.round(n * 100) / 100
}

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function ordinal(n: number) {
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`
}

// Equal parts in cents; the last part takes what rounding leaves.
function amounts(parts: number) {
  const totalCents = Math.round((amount || 0) * 100)
  const each = Math.floor(totalCents / parts)
  return Array.from({ length: parts }, (_, i) => (i === parts - 1 ? totalCents - each * (parts - 1) : each) / 100)
}

function splitEqually(parts: number) {
  const start = new Date(`${termStart}T00:00:00`).getTime()
  const end = new Date(`${termEnd}T00:00:00`).getTime()
  const values = amounts(parts)
  emit('update:modelValue', values.map((value, i) => ({
    label: `${ordinal(i + 1)} installment`,
    amount: value,
    // Evenly through the term, the last part on its final day.
    dueDate: iso(new Date(start + ((end - start) * (i + 1)) / parts)),
  })))
}

function splitMonthly() {
  const values = amounts(months.value.length)
  emit('update:modelValue', months.value.map((date, i) => ({
    label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'long' }),
    amount: values[i]!,
    dueDate: date,
  })))
}

function splitByTerm() {
  const ordered = [...yearTerms].sort((a, b) => (a.termNumber ?? 0) - (b.termNumber ?? 0) || a.endDate.localeCompare(b.endDate))
  const values = amounts(ordered.length)
  emit('update:modelValue', ordered.map((t, i) => ({ label: t.name, amount: values[i]!, dueDate: t.endDate })))
}

function update(index: number, patch: Partial<InstallmentRow>) {
  emit('update:modelValue', modelValue.map((r, i) => (i === index ? { ...r, ...patch } : r)))
}

function remove(index: number) {
  emit('update:modelValue', modelValue.filter((_, i) => i !== index))
}

function add() {
  const last = modelValue[modelValue.length - 1]
  emit('update:modelValue', [...modelValue, {
    label: '',
    amount: difference.value > 0 ? difference.value : null,
    dueDate: last?.dueDate ?? termEnd ?? '',
  }])
}
</script>
