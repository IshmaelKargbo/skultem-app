<template>
  <Metric :record="{
    label: 'Term Average',
    color: 'success',
    value: `${termAverage}%`,
    isReady: isReady,
    icon: STUDENT_ICON,
    subtle: message
  }" />
</template>

<script setup lang="ts">
const { formatScore } = useScoreFormat()
import { ref, watch } from 'vue'

const store = useWidgetStore()
const { id, sessionId, term } = defineProps<{
  id: string
  sessionId: string
  term: Term | undefined
}>()

// Optional - lets a parent (e.g. the dashboard) build an at-a-glance summary out of this and the
// other stat tiles without each one duplicating the other's fetch.
const emit = defineEmits<{ ready: [value: number] }>()

const isReady = ref(false)
const termAverage = ref("0")
const message = ref('')

async function fetchTermAverage() {
  if (!id || term == null) return
  let currentAverage = 0
  try {
    // Each subject's weighted score from approved marks (the Performance tab's breakdown), then their average -
    // the same way the report card averages a term. A plain average over every test also counted drafts and
    // unmarked tests (still 0) and weighed a 10% quiz like the exam.
    const res = await ReportApi().runReport({
      entity: "breakdown",
      title: "Term Average",
      filters: [
        { field: "studentAssessment.enrollment.student.id", value: id, operator: "EQUALS", type: "select" },
        { field: "cycle.term.id", value: term.id, operator: "EQUALS", type: "select" }
      ]
    } as any, 1, 200)

    // Subjects with nothing approved yet have no score and are left out, like on the report card.
    const scored = ((res?.data ?? []) as any[]).map(r => r.score).filter((s: any) => s !== null && s !== undefined)
    currentAverage = scored.length ? scored.reduce((sum: number, s: number) => sum + Number(s), 0) / scored.length : 0
  } catch (err) {
    console.error("Failed to load term average", err)
  } finally {
    message.value = `${term.name}, approved marks`
    termAverage.value = formatScore(currentAverage, '0')
    isReady.value = true
    emit('ready', currentAverage)
  }
}

watch
  (
    () => [sessionId, id, term],
    async () => {
      isReady.value = false
      fetchTermAverage()
    },
    { immediate: true }
  )
</script>