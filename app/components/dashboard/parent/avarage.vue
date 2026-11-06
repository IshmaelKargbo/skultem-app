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
    const res = await store.runAnalytic({
      entity: "assessments",
      title: "Term Average",
      filters: [
        {
          field: "studentAssessment.enrollment.student.id",
          value: id,
          operator: "EQUALS",
          type: "select"
        },
        {
          field: 'cycle.term.id',
          value: term.id,
          operator: "EQUALS",
          type: "select"
        }
      ],
      metrics: [
        {
          name: "Average",
          aggregation: "avg",
          field: "score"
        }
      ],
      chartType: "stat"
    })

    const widget = res?.data ?? res
    currentAverage = Number(widget?.datasets?.[0]?.data?.[0] ?? 0)
  } catch (err) {
    console.error("Failed to load term average", err)
  } finally {
    message.value = `Assessment for ${term.name}`
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