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
import { ref, watch } from 'vue'

const store = useWidgetStore()
const { id, sessionId, term } = defineProps<{
  id: string
  sessionId: string
  term: Term | undefined
}>()

const isReady = ref(false)
const termAverage = ref("0")
const message = ref('')

async function fetchTermAverage() {
  if (term == null) return
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

  message.value = `Assessment for ${term.name}`
  const widget = res?.data ?? res
  const currentAverage = Number(widget?.datasets?.[0]?.data?.[0] ?? 0)
  termAverage.value = currentAverage.toFixed(0)

  isReady.value = true
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