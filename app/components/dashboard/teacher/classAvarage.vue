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
const { formatScore } = useScoreFormat()
const store = useWidgetStore()
// teacherSubjectId: this teacher's subject in one class section - exactly the marks this card is about.
const { term, assessment, teacherSubjectId } = defineProps<{
  assessment: string | undefined
  teacherSubjectId: string | undefined
  term: Term | undefined
}>()

const isReady = ref(false)
const termAverage = ref("0")
const message = ref('')

async function fetchTermAverage() {
  if (term == null || !teacherSubjectId) return

  const res = await store.runAnalytic({
    entity: "assessments",
    title: "Term Average",
    filters: [
      {
        field: "studentAssessment.teacherSubject.id",
        value: teacherSubjectId,
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
      // Approved marks only - a draft or unmarked test (still 0) would drag the average down.
      {
        field: "cycle.status",
        values: ['APPROVED', 'COMPLETED'],
        operator: "IN_LIST",
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

  message.value = `${term.name}, approved marks`
  const widget = res?.data ?? res
  const currentAverage = Number(widget?.datasets?.[0]?.data?.[0] ?? 0)
  termAverage.value = formatScore(currentAverage, '0')

  isReady.value = true
}

watch
  (
    () => [term, teacherSubjectId, assessment],
    async () => {
      isReady.value = false
      await fetchTermAverage()
    },
    { immediate: true }
  )
</script>