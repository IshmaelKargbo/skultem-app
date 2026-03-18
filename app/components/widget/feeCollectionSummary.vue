<template>
  <div>
    <div v-if="!isReady" class="skeleton-loader">Loading Fee Collection Rate...</div>
    <client-only v-else>
      <ApexChart
        type="donut"
        height="350"
        :options="chartOptions"
        :series="chartSeries"
      />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from "vue"

const store     = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady     = ref(false)
const chartSeries = ref<number[]>([])   // ✅ pie = flat number array
const chartLabels = ref<string[]>([])   // ✅ pie labels come from dataset names

const chartOptions = computed(() => ({
  chart: {
    id: "fee-collection-rate",
    toolbar: { show: false }
  },
  title: {
    text: "Fee Collection Rate",
    align: "left",
    style: { fontWeight: "600" }
  },
  labels: chartLabels.value,            // ✅ pie uses options.labels not xaxis
  colors: ["#22C55E", "#EAB308", "#EF4444", "#6366f1"],
  legend: { position: "bottom" },
  tooltip: {
    y: { formatter: (val: number) => `${val.toFixed(1)}%` }
  },
  dataLabels: {
    formatter: (val: number) => `${val.toFixed(1)}%`
  }
}))

onMounted(async () => {
  const res    = await store.runAnalytic({
    entity: "fees",
    title: "Fee Collection Rate",
    filters: [],
    metrics: [
      { field: "amount", aggregation: "percentage", name: "Paid",    tags: { value: "Paid",    field: "status", mode: "count" } },
      { field: "amount", aggregation: "percentage", name: "Pending", tags: { value: "Pending", field: "status", mode: "count" } },
      { field: "amount", aggregation: "percentage", name: "Overdue", tags: { value: "Overdue", field: "status", mode: "count" } },
      { field: "amount", aggregation: "percentage", name: "Partial", tags: { value: "Partial", field: "status", mode: "count" } }
    ],
    chartType: "pie"
  })

  const widget = res?.data ?? res
  if (!widget?.labels) return

  // pie series = flat array of values from each dataset
  chartLabels.value = widget.datasets.map((d: any) => d.label)
  chartSeries.value = widget.datasets.map((d: any) => d.data[0])  // ✅ each dataset has one value

  isReady.value = true
})
</script>

<style scoped>
.chart-card {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

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
  0%, 100% { opacity: 1 }
  50%       { opacity: 0.4 }
}
</style>