<script setup lang="ts">
// Where a payroll run is in its life: Draft -> Generated -> Published.
const { status, compact = false } = defineProps<{
  status?: PayrollRunStatus
  compact?: boolean
}>()

const steps = [
  { key: 'DRAFT', label: 'Review', hint: 'Choose who is paid', icon: 'i-lucide-list-checks' },
  { key: 'GENERATED', label: 'Generate', hint: 'Lock & post to ledger', icon: 'i-lucide-lock' },
  { key: 'PUBLISHED', label: 'Publish', hint: 'Staff see payslips', icon: 'i-lucide-send' },
] as const

const current = computed(() => Math.max(0, steps.findIndex(s => s.key === status)))

function state(index: number) {
  if (status === 'PUBLISHED' || index < current.value) return 'done'
  return index === current.value ? 'active' : 'todo'
}
</script>

<template>
  <ol class="flex items-center gap-2" :class="compact ? 'w-full' : 'w-full sm:gap-3'">
    <template v-for="(step, i) in steps" :key="step.key">
      <li class="flex min-w-0 items-center gap-2">
        <span class="grid shrink-0 place-items-center rounded-full ring-1 transition-colors"
          :class="[
            compact ? 'size-6' : 'size-8',
            state(i) === 'done' && 'bg-success text-inverted ring-success',
            state(i) === 'active' && 'bg-primary/10 text-primary ring-primary',
            state(i) === 'todo' && 'bg-elevated text-dimmed ring-default',
          ]">
          <UIcon :name="state(i) === 'done' ? 'i-lucide-check' : step.icon" :class="compact ? 'size-3' : 'size-4'" />
        </span>
        <div class="min-w-0" :class="compact && 'hidden sm:block'">
          <p class="truncate text-xs font-semibold" :class="state(i) === 'todo' ? 'text-muted' : 'text-highlighted'">
            {{ step.label }}
          </p>
          <p v-if="!compact" class="hidden truncate text-[11px] text-muted md:block">{{ step.hint }}</p>
        </div>
      </li>
      <li v-if="i < steps.length - 1" aria-hidden="true" class="h-px min-w-4 flex-1"
        :class="state(i) === 'done' ? 'bg-success' : 'bg-accented'" />
    </template>
  </ol>
</template>
