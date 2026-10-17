<template>
  <!-- One bar for the whole term mark: a segment per test, sized by its weight; what is still unshared is hatched. -->
  <div class="flex w-full overflow-hidden bg-elevated ring-1 ring-default" role="img"
    :class="compact ? 'h-2.5 rounded-full' : 'h-7 rounded-lg'"
    :aria-label="`${total}% of the term mark shared`">
    <div v-for="(item, i) in items" :key="i" class="flex items-center justify-center overflow-hidden text-[11px] font-medium text-inverted transition-all duration-300"
      :class="SEGMENTS[i % SEGMENTS.length]" :style="{ width: `${Math.min(item.weight, 100)}%` }" :title="`${item.name} ${item.weight}%`">
      <span v-if="!compact" class="truncate px-1">{{ item.weight >= 12 ? item.name : '' }}</span>
    </div>
    <div v-if="total < 100" class="flex-1 bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,var(--ui-border)_4px,var(--ui-border)_5px)]" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ items: { name: string, weight: number }[], compact?: boolean }>()
const SEGMENTS = ['bg-primary', 'bg-info', 'bg-success', 'bg-warning', 'bg-secondary', 'bg-error']
const total = computed(() => props.items.reduce((sum, i) => sum + i.weight, 0))
</script>
