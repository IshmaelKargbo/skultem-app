<template>
  <Metric :record="{
    label: 'Class Average',
    color: 'info',
    value: `${termAverage}%`,
    isReady: isReady,
    icon: PERFORMANCE_ICON,
    subtle: message
  }" />
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { sessionId, term, assessment, teacher } = defineProps<{
  sessionId: string | undefined
  assessment: string | undefined
  teacher: string | undefined
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
        field: "studentAssessment.enrollment.clazz.id",
        value: sessionId,
        operator: "EQUALS",
        type: "select"
      },
      {
        field: 'cycle.term.id',
        value: term.id,
        operator: "EQUALS",
        type: "select"
      },
      {
        field: "cycle.assessment.id",
        value: assessment,
        operator: "EQUALS",
        type: "select"
      },
      {
        field: "cycle.subject.id",
        value: teacher,
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
    () => [term, sessionId, teacher, assessment],
    async () => {
      isReady.value = false
      await fetchTermAverage()
    },
    { immediate: true }
  )
</script>