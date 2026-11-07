<!-- Where a student stands on each part of a fee's installment plan. -->
<template>
  <ol class="space-y-1.5">
    <li v-for="(part, i) in parts" :key="i" class="flex items-center justify-between gap-3 text-xs">
      <div class="flex min-w-0 items-center gap-2">
        <span class="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
          :class="part.state === 'PAID' ? 'bg-success/15 text-success' : part.state === 'OVERDUE' ? 'bg-error/15 text-error' : 'bg-elevated text-muted'">
          <UIcon v-if="part.state === 'PAID'" name="i-lucide-check" class="size-3" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <div class="min-w-0">
          <p class="truncate font-medium text-highlighted">{{ part.label }}</p>
          <p class="text-muted">Due {{ formatDate(part.dueDate) }}</p>
        </div>
      </div>
      <div class="shrink-0 text-right">
        <p class="font-semibold tabular-nums">{{ format(part.amount) }}</p>
        <UBadge size="sm" variant="subtle" :color="INSTALLMENT_STATE[part.state].color"
          :label="part.state === 'PARTIAL' ? `${format(Number(part.amount) - Number(part.paid))} left` : INSTALLMENT_STATE[part.state].label" />
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
const { parts } = defineProps<{ parts: InstallmentStatus[] }>()
const { format } = useMoney()
</script>
