<template>
    <Metric :record="{
        label: 'Attendance Rate',
        color: 'success',
        value: `${attendanceRate}%`,
        isReady: isReady,
        icon: ATTENDANCE_ICON,
        subtle: term ? `${term.name} so far, this section` : 'This section'
    }" />
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { subject, term } = defineProps<{
    subject: TeacherSubject | undefined
    term: Term | undefined
}>()

// One section (and stream), this term so far - not the whole class over every day ever recorded.
function sectionTermFilters(s: TeacherSubject | undefined, term: Term | undefined) {
  if (!s) return []
  const filters: any[] = [
    { field: 'enrollment.clazz.id', value: s.classId, operator: 'EQUALS', type: 'select' },
    { field: 'enrollment.section.id', value: s.sectionId, operator: 'EQUALS', type: 'select' }
  ]
  if (s.streamId) filters.push({ field: 'enrollment.stream.id', value: s.streamId, operator: 'EQUALS', type: 'select' })
  if (term?.startDate) {
    const today = new Date().toISOString().slice(0, 10)
    const end = term.endDate && term.endDate.slice(0, 10) < today ? term.endDate.slice(0, 10) : today
    filters.push({ field: 'date', value: term.startDate.slice(0, 10), valueTo: end, operator: 'BETWEEN', type: 'date' })
  }
  return filters
}


const isReady = ref(false)
const attendanceRate = ref("0.0")

async function fetchRecord() {
    if (!subject) return
    const res = await store.runAnalytic({
        entity: "attendances",
        title: "Attendance Rate",
        filters: sectionTermFilters(subject, term),
        metrics: [
            {
                name: "Present",
                aggregation: "percentage",
                field: "state",
                tags: { field: "state", value: "Present" }
            },
            {
                name: "Late",
                aggregation: "percentage",
                field: "state",
                tags: { field: "state", value: "Late" }
            }
        ],
        chartType: "stat"
    })

    const widget = res?.data ?? res

    const present = Number(widget?.datasets?.[0]?.data?.[0] ?? 0)
    const late = Number(widget?.datasets?.[1]?.data?.[0] ?? 0)

    attendanceRate.value = Math.min(present + late, 100).toFixed(1)

    isReady.value = true
}

watch(() => [subject?.id, term?.id], async () => {
    isReady.value = false
    await fetchRecord()
}, { immediate: true })
</script>