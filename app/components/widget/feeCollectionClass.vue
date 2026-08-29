<template>
  <div>
    <div v-if="!isReady" class="skeleton-loader">Loading Fee by Class...</div>
    <div v-else-if="!labels.length" class="empty-state">
      <UIcon name="i-lucide-bar-chart-3" class="text-4xl text-muted" />
      <p class="mt-2 text-sm text-muted">No fee collection data for this period yet.</p>
    </div>
    <client-only v-else>
      <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
const { format } = useMoney()
const store = useWidgetStore()
const { title, dateFilter } = defineProps<{
  title?: string
  dateFilter?: any
}>()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const chartSeries = ref<any[]>([])

const chartOptions = computed(() => ({
  chart: {
    id: "fee-by-class",
    toolbar: { show: false },
  },
  title: {
    text: title || "Fee Collection by Class",
    align: "left",
    style: { fontWeight: "600" },
  },
  colors: ["#029444", "#ce031e"],
  xaxis: {
    categories: labels.value,
    labels: {
      formatter: (val: number) => val.toLocaleString(),
      style: { fontSize: "12px" },
    },
  },
  yaxis: {
    labels: { style: { fontSize: "12px" } },
  },
  grid: { borderColor: "var(--app-border)", strokeDashArray: 4 },
  tooltip: {
    shared: true,
    intersect: false,
    y: { formatter: (val: number) => format(val) },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      barHeight: "60%",
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => format(val),
    style: {
      fontSize: "11px",
      colors: ["#fff"],
    },
  },
  legend: { position: "bottom" },
}))

async function fetchRecord() {
  isReady.value = false

  const res = await store.runAnalytic({
    entity: "fees",
    title: title || "Fee Collection by Class",
    filters: dateFilter ? [dateFilter] : [],
    metrics: [
      {
        field: "amount",
        aggregation: "sum",
        name: "Paid",
        tags: {
          groupBy: "clazz",
          field: "status",
          value: "Paid",
          orderBy: "Paid",
          order: "desc",
        },
      },
      {
        field: "amount",
        aggregation: "sum",
        name: "Unpaid",
        tags: {
          groupBy: "clazz",
          field: "status",
          value: "Pending",
        },
      },
      {
        field: "amountPaid",
        aggregation: "sum",
        name: "Partial",
        tags: {
          groupBy: "clazz",
          field: "status",
          value: "Partial",
        },
      },
    ],
    chartType: "bar",
  })

  const widget = res?.data ?? res
  if (!widget) return

  if (Array.isArray(widget)) {
    labels.value = widget.map((r: any) => r.clazz)
    chartSeries.value = [
      { name: "Paid",   data: widget.map((r: any) => Number(r.Paid ?? 0) + Number(r.Partial ?? 0)) },
      { name: "Unpaid", data: widget.map((r: any) => Number(r.Unpaid ?? 0)) },
    ]
  } else {
    labels.value = widget.labels

    const paid    = widget.datasets.find((d: any) => d.label === "Paid")
    const partial = widget.datasets.find((d: any) => d.label === "Partial")
    const unpaid  = widget.datasets.find((d: any) => d.label === "Unpaid")

    const mergedPaid = paid?.data.map((v: number, i: number) => v + (partial?.data[i] ?? 0)) ?? []

    chartSeries.value = [
      { name: "Paid",   data: mergedPaid },
      { name: "Unpaid", data: unpaid?.data ?? [] },
    ]
  }

  isReady.value = true
}

watch(() => dateFilter, fetchRecord)

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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>