<template>
  <div v-if="!isReady" class="skeleton-loader">
    Loading Class Performance...
  </div>

  <client-only v-else>
    <ApexChart
      type="bar"
      height="350"
      :options="chartOptions"
      :series="chartSeries"
    />
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
    id: "class-performance",
    toolbar: { show: false }
  },
  title: {
    text: "Class Average Score",
    align: "left",
    style: { fontWeight: 600 }
  },
  colors: ["#048339"],
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
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4
  },
  tooltip: {
    y: {
      formatter: (val: number) => val.toFixed(2)
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: "45%"
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(2)
  }
}))

onMounted(loadData)

async function loadData() {
  try {
    const payload = {
      entity: "assessments",
      title: "Class Performance",
      filters: [],
      metrics: [
        {
          name: "Average Score",
          aggregation: "avg",
          field: "weightScore",
          tags: { groupBy: "clazz", "orderBy": "weightScore", order: "desc" }
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
      data: d.data
    }))

    isReady.value = true
  } catch (err) {
    console.error("Failed to load class performance", err)
  }
}
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
  0%,100% { opacity: 1 }
  50% { opacity: 0.4 }
}
</style>