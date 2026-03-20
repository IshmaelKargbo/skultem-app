<template>
  <UCard>
    <div v-if="!isReady" class="skeleton-loader">
      Loading Subject Performance...
    </div>

    <client-only v-else>
      <ApexChart
        type="bar"
        height="350"
        :options="chartOptions"
        :series="chartSeries"
      />
    </client-only>
  </UCard>
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { id } = defineProps<{ id: string }>()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
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
    text: "Average score per subject",
    align: "left",
    style: {
      fontSize: "12px",
      color: "#6b7280"
    }
  },

  colors: ["#5805b6"],

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

  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4
  },

  tooltip: {
    y: {
      formatter: (val: number) => `${val.toFixed(1)}%`
    }
  },

  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: "45%"
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
        }
      ],
      metrics: [
        {
          name: "Average Score",
          aggregation: "avg",
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
  0%,100% { opacity: 1 }
  50% { opacity: 0.4 }
}
</style>