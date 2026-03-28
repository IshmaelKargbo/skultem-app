<template>
  <UCard>
    <div>
      <div v-if="!isReady" class="skeleton-loader">
        Loading Class Performance...
      </div>

      <client-only v-else>
        <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
      </client-only>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { id } = defineProps<{
  id: string
}>()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const colors = ref<string[]>([])
const chartSeries = ref<any[]>([])

const chartOptions = computed(() => ({
  chart: {
    id: "grade-trend",
    toolbar: { show: false }
  },
  title: {
    text: "Grade Trend",
    align: "left",
    style: { fontWeight: 600 }
  },
  subtitle: {
    text: "Average score per subject",
    align: "left",
    style: {
      fontSize: "12px",
      color: "#6b7280"
    }
  },
  xaxis: {
    categories: labels.value,
    labels: { style: { fontSize: "12px" } }
  },
  yaxis: {
    title: { text: "Average Score" },
    labels: {
      formatter: (val: number) => val.toFixed(2)
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
      formatter: (val: number) => val.toFixed(2)
    }
  },

  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(2)
  }
}))

async function loadData() {
  try {
    const payload = {
      entity: "assessments",
      title: "Class Performance",
      filters: [
        {
          field: "studentAssessment.enrollment.student.id",
          value: id,
          operator: "EQUALS",
          type: "select"
        }
      ],
      metrics: [
        {
          name: "Average Score",
          aggregation: "avg",
          field: "score",
          tags: { groupBy: "term" }
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
      data: d.data.map((v: number) => Math.round(v))
    }))

    isReady.value = true
  } catch (err) {
    console.error("Failed to load class performance", err)
  }
}

watch(
  () => id,
  async () => {
    isReady.value = false
    await loadData()
  },
  { immediate: true }
)
</script>

<style scoped>
.skeleton-loader {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
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