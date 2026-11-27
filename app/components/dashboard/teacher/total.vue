<template>
  <Metric :record="{
    label: 'Total Students',
    color: 'primary',
    value: value,
    isReady: isReady,
    icon: STUDENT_ICON,
    subtle: 'In this class section'
  }" />
</template>

<script setup lang="ts">
const { formatScore } = useScoreFormat()
import { ref, watch } from 'vue'

const store = useWidgetStore()
// The section this subject is taught in.
const { subject } = defineProps<{
  subject: TeacherSubject | undefined
}>()

const isReady = ref(false)
const value = ref("0")

async function fetchTermAverage() {
  if (!subject) return

  const res = await store.runAnalytic({
    entity: "students",
    title: "Total Students",
    // Enrollments (this report counts them): this class section, this academic year, still at school.
    filters: [
      { field: "clazz.id", value: subject.classId, operator: "EQUALS", type: "select" },
      { field: "section.id", value: subject.sectionId, operator: "EQUALS", type: "select" },
      ...(subject.streamId ? [{ field: "stream.id", value: subject.streamId, operator: "EQUALS", type: "select" }] : []),
      { field: "status", value: "ACTIVE", operator: "EQUALS", type: "select" },
      { field: "academicYear.active", value: "true", operator: "EQUALS", type: "boolean" }
    ],
    metrics: [
      {
        name: "Total",
        aggregation: "count"
      }
    ],
    chartType: "stat"
  })

  const widget = res?.data ?? res
  const currentAverage = Number(widget?.datasets?.[0]?.data?.[0] ?? 0)
  value.value = formatScore(currentAverage, '0')

  isReady.value = true
}

watch
  (
    () => [subject?.id],
    async () => {
      isReady.value = false
      await fetchTermAverage()
    },
    { immediate: true }
  )
</script>