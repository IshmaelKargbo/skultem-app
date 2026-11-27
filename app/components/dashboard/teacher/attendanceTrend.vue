<template>
  <UCard>
    <div>
      <div v-if="!isReady" class="skeleton-loader">
        Loading Attendance Trend...
      </div>

      <client-only v-else>
        <ChartScroll>
          <ApexChart type="area" height="350" :options="chartOptions" :series="chartSeries" />
        </ChartScroll>
      </client-only>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const chartSeries = ref<any[]>([])

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


const chartOptions = computed(() => ({
  chart: {
    id: "attendance-trend",
    toolbar: { show: false },
    zoom: { enabled: false }
  },

  title: {
    text: "Attendance Trend",
    align: "left",
    style: { fontWeight: "600" }
  },

  stroke: {
    curve: "smooth",
    width: 3
  },

  colors: ["#22C55E", "#EF4444", "#F59E0B", "#3B82F6"],

  // Numbers on every point pile up on a phone; the tooltip shows them instead.
  dataLabels: { enabled: false },
  markers: { size: labels.value.length <= 12 ? 4 : 0, hover: { size: 6 } },

  xaxis: spacedXAxis(labels.value),

  grid: {
    borderColor: "#f1f5f9"
  },

  legend: {
    position: "bottom"
  },
}))

async function fetchRecord() {
  if (!subject) return

  const res = await store.runAnalytic({
    entity: "attendances",
    title: "Attendance Trend",
    filters: sectionTermFilters(subject, term),
    metrics: [
      {
        name: "Present",
        aggregation: "count",
        tags: {
          field: "state",
          value: "Present",
          groupBy: "date",
          interval: "week"
        }
      },
      {
        name: "Absent",
        aggregation: "count",
        tags: {
          field: "state",
          value: "Absent",
          groupBy: "date",
          interval: "week"
        }
      },
      {
        name: "Late",
        aggregation: "count",
        tags: {
          field: "state",
          value: "Late",
          groupBy: "date",
          interval: "week"
        }
      },
      {
        name: "Excused",
        aggregation: "count",
        tags: {
          field: "state",
          value: "Excused",
          groupBy: "date",
          interval: "week"
        }
      }
    ],
    chartType: "line"
  })

  const widget = res?.data ?? res

  labels.value = (widget?.labels ?? []).map((l: string) => isoWeekLabel(l))

  chartSeries.value = (widget?.datasets ?? []).map((d: any) => ({
    name: d.label,
    data: d.data
  }))

  isReady.value = true
}

watch(() => [subject?.id, term?.id], async () => {
  isReady.value = false
  await fetchRecord()
}, { immediate: true })
</script>

<style scoped>
.skeleton-loader {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #80766b;
  font-weight: 500;
  background: #f3f4f6;
  border-radius: 0.5rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1
  }

  50% {
    opacity: 0.4
  }
}
</style>