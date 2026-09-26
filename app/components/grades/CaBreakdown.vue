<template>
  <div v-if="c" class="rounded-lg border border-default bg-elevated/30 px-3 py-2 text-xs">
    <div v-if="empty" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
      <span>No CA or formal test marks recorded yet · {{ c.caPercentage }}% classwork + {{ c.formalPercentage }}% formal test</span>
      <UBadge v-if="progress" size="sm" variant="subtle" color="warning" icon="lucide:clock">{{ progress }}</UBadge>
    </div>
    <div v-else class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span class="text-muted">
        Classwork (CA)
        <template v-if="c.caScore != null">
          <span class="font-semibold text-highlighted">{{ c.caScore }}%</span>
          <span class="text-muted">= {{ c.caPoints }}/{{ c.caPercentage }} of the mark</span>
        </template>
        <span v-else class="font-medium text-highlighted">none recorded yet</span>
      </span>
      <span class="text-muted">
        Formal test
        <template v-if="c.formalScore != null">
          <span class="font-semibold text-highlighted">{{ c.formalScore }}%</span>
          <span class="text-muted">= {{ c.formalPoints }}/{{ c.formalPercentage }} of the mark</span>
        </template>
        <span v-else class="font-medium text-highlighted">not taken yet</span>
      </span>
      <UBadge v-if="progress" size="sm" variant="subtle" color="warning" icon="lucide:clock">{{ progress }}</UBadge>
      <span v-if="progress && soFar !== null" class="text-muted">
        Score so far <span class="font-semibold text-highlighted">{{ soFar }}</span>
      </span>
      <UBadge v-if="trend.trend !== 'not-enough-data'" size="sm" variant="subtle"
        :color="trend.trend === 'improving' ? 'success' : trend.trend === 'declining' ? 'error' : 'neutral'"
        :icon="trend.trend === 'improving' ? 'lucide:trending-up' : trend.trend === 'declining' ? 'lucide:trending-down' : 'lucide:minus'">
        {{ CA_TREND_LABEL[trend.trend] }}
      </UBadge>
    </div>
    <p v-if="!empty && recorded.length" class="mt-1 text-muted">
      {{ CA_UNITS[c.caFrequency].singular }}-by-{{ CA_UNITS[c.caFrequency].singular.toLowerCase() }}:
      <span class="font-medium text-highlighted">{{ recorded.join(' · ') }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
// The breakdown behind one continuous-assessment score, shown once the grades are released - the same
// "Test 1: 80%" the family already sees, with the classwork and formal test it is made of.
const props = defineProps<{ grade: { continuous?: ContinuousBreakdown | null, status?: string } }>()

const c = computed(() => props.grade.continuous?.structure === 'CA_AND_TEST' ? props.grade.continuous : null)
// Management sees a CA assessment while it is still being recorded (families only see it once released), so say so.
const progress = computed(() => {
  switch (props.grade.status) {
    case 'DRAFT': return 'Recording in progress'
    case 'RETURNED': return 'Returned for correction'
    case 'SUBMITTED': return 'Awaiting approval'
    default: return ''
  }
})
const soFar = computed(() => c.value
  ? caCombine(c.value.caScore, c.value.formalScore, c.value.caPercentage, c.value.formalPercentage) : null)
const empty = computed(() => !!c.value && c.value.caScore == null && c.value.formalScore == null
  && !(c.value.caEntryScores ?? []).some(v => v !== null && v !== undefined))
const trend = computed(() => caTrendOf(c.value?.caEntryScores ?? []))
const recorded = computed(() => (c.value?.caEntryScores ?? []).map(v => v ?? '-'))
</script>
