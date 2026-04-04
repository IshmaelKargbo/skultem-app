<template>
  <div>
    <div v-if="!isReady" class="skeleton-loader">Loading Monthly Revenue...</div>
    <client-only v-else>
      <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
const { format } = useMoney()
const store = useWidgetStore()
const { title } = defineProps<{ title?: string }>()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const chartSeries = ref<any[]>([])
const colors = ref<string[]>([])

// Helper to sort months
const monthOrder: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
}

const chartOptions = computed(() => ({
  chart: { id: "monthly-profit-loss", toolbar: { show: false } },
  title: { text: title || "Monthly Profit & Loss", align: "left", style: { fontWeight: "600" } },
  xaxis: { categories: labels.value, labels: { style: { fontSize: "12px" } } },
  yaxis: { labels: { style: { fontSize: "12px" } } },
  colors: colors.value,
  plotOptions: { bar: { borderRadius: 6, horizontal: false, columnWidth: "45%" } },
  dataLabels: { enabled: true, formatter: (val: number) => format(val), style: { fontSize: "11px", colors: ["#fff"] } },
  tooltip: { y: { formatter: (val: number) => format(val) } },
  legend: { position: "bottom" },
  grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
}))

onMounted(async () => {
  const res = await store.runAnalytic({
    entity: "transactions",
    title: title || "Monthly Profit & Loss",
    filters: [],
    metrics: [
      { field: "amount", aggregation: "sum", name: "Revenue", tags: { field: "direction", value: "CREDIT", groupBy: "termId" } },
      { field: "amount", aggregation: "sum", name: "Expenses", tags: { field: "direction", value: "DEBIT", groupBy: "termId" } },
      { field: "amount", aggregation: "sum", name: "Profit", tags: { groupBy: "term" } },
    ],
    chartType: "bar",
  })

  const widget = res?.data ?? res
  if (!widget) return

  if (Array.isArray(widget)) {
    widget.sort((a: any, b: any) => (monthOrder[a.month] || 0) - (monthOrder[b.month] || 0))

    labels.value = widget.map((r: any) => r.month)
    chartSeries.value = [
      { name: "Revenue", data: widget.map((r: any) => Number(r.Revenue ?? 0)) },
      { name: "Expenses", data: widget.map((r: any) => Number(r.Expenses ?? 0)) },
      { name: "Profit", data: widget.map((r: any) => Number(r.Profit ?? 0)) },
    ]
  } else {
    labels.value = widget.labels
    const revenue = widget.datasets.find((d: any) => d.label === "Revenue")?.data ?? []
    const expenses = widget.datasets.find((d: any) => d.label === "Expenses")?.data ?? []
    const profit = widget.datasets.find((d: any) => d.label === "Profit")?.data ?? []

    chartSeries.value = [
      { name: "Revenue", data: revenue },
      { name: "Expenses", data: expenses },
      { name: "Profit", data: profit },
    ]
  }

  colors.value = ["#10b981", "#ef4444", "#3b82f6"]
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>