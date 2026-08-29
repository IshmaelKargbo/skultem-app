<template>
  <div>
    <div v-if="!isReady" class="skeleton-loader">Loading Monthly Revenue...</div>
    <div v-else-if="!labels.length" class="empty-state">
      <UIcon name="i-lucide-bar-chart-3" class="text-4xl text-muted" />
      <p class="mt-2 text-sm text-muted">No profit &amp; loss data for this period yet.</p>
    </div>
    <client-only v-else>
      <ApexChart type="line" height="350" :options="chartOptions" :series="chartSeries" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
const { format } = useMoney()
const store = useWidgetStore()
// filters is owned by the page (built from the one general financial-reports filter shared
// across all the report tabs), not by this widget.
const { title, filters } = defineProps<{ title?: string, filters?: any[] }>()
const emit = defineEmits<{ totals: [{ revenue: number, expenses: number, profit: number }] }>()
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
  stroke: { width: 3, curve: "smooth" },
  markers: { size: 5 },
  dataLabels: { enabled: false },
  tooltip: { shared: true, intersect: false, y: { formatter: (val: number) => format(val) } },
  legend: { position: "bottom" },
  grid: { borderColor: "var(--app-border)", strokeDashArray: 4 },
}))

async function fetchRecord() {
  isReady.value = false

  const res = await store.runAnalytic({
    entity: "transactions",
    title: title || "Monthly Profit & Loss",
    filters: filters ?? [],
    metrics: [
      // groupBy has to name a real field on TransactionDTO - there's no termId there (only
      // term, the term's name), so "termId" silently matched nothing and every transaction got
      // dropped during grouping, leaving this chart permanently empty regardless of real data.
      // Grouping by createdAt/month (matching the Monthly Revenue vs Expenses widget) instead of
      // by term gives an actual monthly profit & loss trend rather than one bar per term.
      { field: "amount", aggregation: "sum", name: "Revenue", tags: { field: "direction", value: "CREDIT", groupBy: "createdAt", interval: "month" } },
      { field: "amount", aggregation: "sum", name: "Expenses", tags: { field: "direction", value: "DEBIT", groupBy: "createdAt", interval: "month" } },
      { field: "amount", aggregation: "sum", name: "Profit", tags: { groupBy: "createdAt", interval: "month" } },
    ],
    chartType: "line",
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
    const rawLabels = (widget.labels ?? []).map((l: any) => clean(l))
    const revenue = widget.datasets.find((d: any) => d.label === "Revenue")?.data ?? []
    const expenses = widget.datasets.find((d: any) => d.label === "Expenses")?.data ?? []
    const profit = widget.datasets.find((d: any) => d.label === "Profit")?.data ?? []

    const combined = rawLabels.map((month: string, i: number) => ({
      month,
      revenue: Number(revenue[i] ?? 0),
      expenses: Number(expenses[i] ?? 0),
      profit: Number(profit[i] ?? 0),
    }))

    combined.sort((a: any, b: any) => (monthOrder[a.month] || 0) - (monthOrder[b.month] || 0))

    labels.value = combined.map((r: any) => r.month)
    chartSeries.value = [
      { name: "Revenue", data: combined.map((r: any) => r.revenue) },
      { name: "Expenses", data: combined.map((r: any) => r.expenses) },
      { name: "Profit", data: combined.map((r: any) => r.profit) },
    ]
  }

  colors.value = ["#10b981", "#ef4444", "#3b82f6"]
  isReady.value = true

  // The summary cards above this chart (Total Revenue/Expenses/Profit) used to be hardcoded
  // placeholder numbers - hand the parent the real totals for the same range this chart just
  // rendered, rather than it having to run a second, separate query for them.
  const sum = (name: string) => (chartSeries.value.find(s => s.name === name)?.data ?? [])
    .reduce((total: number, value: number) => total + Number(value || 0), 0)

  emit("totals", { revenue: sum("Revenue"), expenses: sum("Expenses"), profit: sum("Profit") })
}

watch(() => filters, fetchRecord)

onMounted(fetchRecord)
</script>

<style scoped>
.skeleton-loader {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-soft);
  font-weight: 500;
  background: var(--app-border);
  border-radius: 0.5rem;
  animation: pulse 1.5s infinite;
}

.empty-state {
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
</style>