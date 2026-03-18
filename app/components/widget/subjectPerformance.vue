<template>
  <div v-if="!isReady" class="skeleton-loader">Loading Subject Performance...</div>
  <client-only v-else>
    <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
  </client-only>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from "vue"

const store = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const chartSeries = ref<any[]>([])
const chartOptions = computed(() => ({
  chart: {
    id: "subject-performance",
    toolbar: { show: false }
  },
  title: {
    text: "Subject Average Score",
    align: "left",
    style: { fontWeight: "600" }
  },
  colors: ["#7b2183"],
  xaxis: {
    categories: labels.value,
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: {
    labels: { style: { fontSize: "12px" } }
  },
  grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
  tooltip: {
    shared: true,
    intersect: false,
    x: { formatter: (val: string) => val },
    y: { formatter: (val: number) => val.toFixed(2) }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: "50%"
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(2)
  }
}))

onMounted(async () => {
  const res = await store.runAnalytic({
    entity: "assessments",
    title: "Subject Performance",
    filters: [],
    metrics: [
      {
        name: "Annual Score",
        aggregation: "avg",
        field: "weightScore",
        tags: {
          groupBy: "subject" 
        }
      }
    ],
    chartType: "bar"
  })

  const widget = res?.data ?? res
  if (!widget) return

  if (Array.isArray(widget)) {
    labels.value = widget.map((r: any) => r.subject)
    chartSeries.value = [{
      name: "Average Score",
      data: widget.map((r: any) => parseFloat(Number(r["Average Score"]).toFixed(2)))
    }]
  } else {
    labels.value = widget.labels
    chartSeries.value = widget.datasets.map((d: any) => ({ name: d.label, data: d.data }))
  }

  isReady.value = true
})
</script>

<style scoped>
.skeleton-loader {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
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