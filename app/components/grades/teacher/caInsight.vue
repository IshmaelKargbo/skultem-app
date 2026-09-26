<template>
  <div v-if="insight" class="rounded-xl border border-default bg-elevated/40 p-3 space-y-2.5">
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">Insight - {{ assessment.name }}</p>
      <p class="text-xs text-muted">{{ insight.recorded }}/{{ insight.total }} have a CA average</p>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div>
        <p class="text-xs text-muted">Class CA average</p>
        <p class="text-sm font-semibold text-highlighted">{{ insight.avgCa ?? '-' }}<span v-if="insight.avgCa !== null">%</span></p>
      </div>
      <div>
        <p class="text-xs text-muted">Class test average</p>
        <p class="text-sm font-semibold text-highlighted">{{ insight.avgFormal ?? '-' }}<span v-if="insight.avgFormal !== null">%</span></p>
      </div>
      <div>
        <p class="text-xs text-muted">CA vs test</p>
        <p class="text-sm font-semibold" :class="gapClass">{{ gapLabel }}</p>
      </div>
      <div>
        <p class="text-xs text-muted">Trending</p>
        <p class="text-sm font-semibold text-highlighted">
          <span class="text-success">{{ insight.improving }} up</span> ·
          <span class="text-error">{{ insight.declining }} down</span>
        </p>
      </div>
    </div>

    <div v-if="insight.needsAttention.length" class="border-t border-dashed border-default pt-2">
      <p class="mb-1 text-xs font-medium text-muted">Worth a look</p>
      <ul class="space-y-1">
        <li v-for="s in insight.needsAttention" :key="s.studentId" class="flex items-center justify-between gap-2 text-xs">
          <span class="truncate text-highlighted">{{ s.name }}</span>
          <span class="shrink-0 text-muted">{{ s.reason }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ assessment: Assessment, rows: StudentAssessment[] }>()

const insight = computed(() => caClassInsight(props.rows, props.assessment.id))

const gapLabel = computed(() => {
  const g = insight.value?.gap
  if (g === null || g === undefined) return '-'
  if (Math.abs(g) < 3) return 'Even'
  return g > 0 ? `CA +${g}` : `Test +${Math.abs(g)}`
})
const gapClass = computed(() => {
  const g = insight.value?.gap
  if (g === null || g === undefined || Math.abs(g) < 3) return 'text-highlighted'
  return 'text-warning'
})
</script>
