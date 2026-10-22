<template>
  <UCard>
    <div v-if="!isReady || loading" class="skeleton-loader">
      Loading Subject Performance...
    </div>

    <div v-else-if="rows && !rows.length" class="flex h-[350px] flex-col items-center justify-center gap-2 text-center">
      <UIcon name="lucide:bar-chart-3" class="size-8 text-muted" />
      <p class="text-sm font-semibold text-highlighted">Subject Performance</p>
      <p class="text-xs text-muted">No approved assessments for this term yet.</p>
    </div>

    <client-only v-else>
      <ChartScroll>
        <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
      </ChartScroll>
    </client-only>
  </UCard>
</template>

<script setup lang="ts">
const store = useWidgetStore()
// rows: subject scores already worked out by the caller (the student performance page's breakdown) - charted as
// given, so the chart and the breakdown below it always agree. Without it the chart fetches its own.
const { id, term, rows, loading = false } = defineProps<{
  id: string | undefined
  term: string | undefined
  rows?: { name: string, score: number }[]
  loading?: boolean
}>()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const colors = ref<string[]>([])
const chartSeries = ref<any[]>([])
const chartOptions = computed(() => ({
  chart: {
    id: "student-subject-performance",
    toolbar: { show: false },
    fontFamily: "inherit"
  },

  title: {
    text: "Subject Performance",
    align: "left",
    style: {
      fontWeight: 600,
      fontSize: "16px"
    }
  },

  subtitle: {
    text: rows ? "Weighted score per subject, approved assessments only" : "Average score per subject",
    align: "left",
    style: {
      fontSize: "12px",
      color: "#6b7280"
    }
  },
  xaxis: {
    categories: labels.value,
    labels: {
      style: { fontSize: "12px" }
    }
  },

  yaxis: {
    title: { text: "Score (%)" },
    labels: {
      formatter: (val: number) => `${val}%`
    }
  },

  colors: colors.value,

  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4
  },

  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: "45%",
      distributed: true
    }
  },
  
  tooltip: {
    y: {
      formatter: (val: number) => `${val.toFixed(1)}%`
    }
  },

  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
    style: {
      fontWeight: 600
    }
  },

  legend: { show: false }
}))

async function loadData() {
  if (rows) {
    labels.value = rows.map(r => r.name)
    colors.value = generateColors(labels.value.length)
    chartSeries.value = [{ name: 'Score', data: rows.map(r => r.score) }]
    isReady.value = true
    return
  }
  if (id == '' || term == '') return
  try {
    const payload = {
      entity: "assessments",
      title: "Subject Performance",
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
        },
        // Unmarked work comes back as 0 - only settled scores belong in the chart.
        {
          field: "cycle.status",
          values: ['APPROVED', 'COMPLETED', 'LOCKED'],
          operator: "IN_LIST",
          type: "select"
        }
      ],
      metrics: [
        {
          name: "Average Score",
          aggregation: "sum",
          field: "weightScore",
          tags: { groupBy: "subject" }
        }
      ],
      chartType: "bar"
    }

    const res = await store.runAnalytic(payload)
    const widget = res?.data ?? res

    if (!widget?.labels || !widget?.datasets) return

    labels.value = widget.labels
    colors.value = generateColors(labels.value.length)
    chartSeries.value = widget.datasets.map((d: any) => ({
      name: d.label,
      data: d.data.map((v: number) => Number(v.toFixed(2)))
    }))

    isReady.value = true
  } catch (err) {
    console.error("Failed to load subject performance", err)
  }
}

watch(
  () => [id, term, rows],
  async () => {
    isReady.value = false
    await loadData()
  },
  { immediate: true }
)
</script>

<style scoped>
.skeleton-loader {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f0a9c;
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