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
const { id, sessionId } = defineProps<{
  id: string
  sessionId: string
}>()

const isReady = ref(false)
const termAverage = ref("0")
const message = ref('')
const studentStore = useStudentStore()

const { activeCycle } = storeToRefs(studentStore)

async function fetchTermAverage() {
  if (activeCycle == null) return

  const term = activeTerm()
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
        value: term,
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

  message.value = `Assessment for ${activeTermName()}`
  const widget = res?.data ?? res
  const currentAverage = Number(widget?.datasets?.[0]?.data?.[0] ?? 0)
  termAverage.value = currentAverage.toFixed(0)

  isReady.value = true
}

async function fetchCycle() {
  if (sessionId == "") return null
  await studentStore.fetchActiveCycle(sessionId)
  fetchTermAverage()
}

function activeTerm() {
  if (activeCycle.value == null) return

  const active = activeCycle.value.terms.find(e => e.status == "ACTIVE")
  if (active == null) return ""

  return active.id
}

function activeTermName() {
  if (activeCycle.value == null) return

  const active = activeCycle.value.terms.find(e => e.status == "ACTIVE")
  if (active == null) return ""

  return active.name
}

watch
  (
    () => sessionId,
    async () => {
      isReady.value = false
      await fetchCycle()
    },
    { immediate: true }
  )
</script>