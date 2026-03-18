<template>
  <div>
    <div v-if="!isReady" class="skeleton-loader">Loading Fee Collection by Category...</div>
    <client-only v-else-if="chartSeries.length > 0">
      <ApexChart
        type="pie"
        height="350"
        :options="chartOptions"
        :series="chartSeries"
        :key="chartSeries.join()"
      />
    </client-only>
    <div v-else class="skeleton-loader">No data available</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from "vue"

const store     = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady      = ref(false)
const chartSeries  = ref<number[]>([])
const chartLabels  = ref<string[]>([])
const chartOptions = ref<any>(null)

function buildOptions(labels: string[]) {
  return {
    chart: {
      id: "fee-by-category",
      toolbar: { show: false }
    },
    title: {
      text: "Fee Collection by Category",
      align: "left",
      style: { fontSize: "15px", fontWeight: "600", color: "#111827" }
    },
    subtitle: {
      text: "Total amount paid per fee type",
      align: "left",
      style: { fontSize: "12px", color: "#6b7280" }
    },
    labels,
    colors: ["#22C55E", "#6366f1", "#EAB308", "#EF4444", "#06B6D4", "#F97316"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px"
    },
    tooltip: {
      y: { formatter: (val: number) => `NLE ${val.toLocaleString()}` }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      dropShadow: { enabled: false }
    },
    responsive: [{
      breakpoint: 480,
      options: { legend: { position: "bottom" } }
    }]
  }
}

onMounted(async () => {
  const res = await store.runAnalytic({
    entity: "fees",
    title: "Fee Collection by Category",
    metrics: [
      {
        field: "amountPaid",
        aggregation: "sum",
        name: "Total Paid",
        tags: { groupBy: "fee" }
      }
    ],
    chartType: "pie"
  })

  const widget = res?.data ?? res
  if (!widget) return

  if (Array.isArray(widget)) {
    // Shape: [{ category: "Exam Fee", "Total Paid": 600 }, ...]
    chartLabels.value = widget.map((r: any) => r.category)
    chartSeries.value = widget.map((r: any) => Number(r["Total Paid"]))
  } else {
    // Shape: { labels: [...], datasets: [{ label: "...", data: [...] }] }
    chartLabels.value = widget.labels
    chartSeries.value = widget.datasets[0].data.map(Number) // ✅ fixed: all values from single dataset
  }

  chartOptions.value = buildOptions(chartLabels.value)
  isReady.value      = true
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
  0%, 100% { opacity: 1 }
  50%       { opacity: 0.4 }
}
</style>