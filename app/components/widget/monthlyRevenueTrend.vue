<template>
  <div>
    <div v-if="!isReady" class="skeleton-loader">
      Loading Monthly Revenue vs Expenses...
    </div>

    <div v-else-if="!labels.length" class="empty-state">
      <UIcon name="i-lucide-bar-chart-3" class="text-4xl text-muted" />
      <p class="mt-2 text-sm text-muted">No revenue or expense data for this period yet.</p>
    </div>

    <client-only v-else>
      <ApexChart type="line" height="350" :options="chartOptions" :series="chartSeries" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from "vue"

const { format } = useMoney()
const store = useWidgetStore()
const { filters } = defineProps<{ filters?: any[] }>()

const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const chartSeries = ref<any[]>([])

const chartOptions = computed(() => ({
  chart: {
    id: "monthly-revenue-expenses",
    toolbar: { show: false },
  },

  title: {
    text: "Monthly Revenue vs Expenses",
    align: "left",
    style: { fontWeight: "600" },
  },

  colors: ["#22c55e", "#ef4444"],

  stroke: {
    width: 3,
    curve: "smooth",
  },

  markers: {
    size: 5,
  },

  xaxis: {
    categories: labels.value,
    labels: {
      style: { fontSize: "12px" },
    },
  },

  grid: {
    borderColor: "var(--app-border)",
    strokeDashArray: 4,
  },

  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => format(val),
    },
  },

  dataLabels: {
    enabled: false,
  },

  legend: {
    position: "bottom",
  },
}))

async function fetchRecord() {
  isReady.value = false

  const res = await store.runAnalytic({
    entity: "transactions",
    title: "Monthly Revenue vs Expenses",
    filters: filters ?? [],
    metrics: [
      {
        field: "amount",
        aggregation: "sum",
        name: "Revenue",
        tags: {
          field: "direction",
          value: "CREDIT",
          groupBy: "createdAt",
          interval: "month",
        },
      },
      {
        field: "amount",
        aggregation: "sum",
        name: "Expenses",
        tags: {
          field: "direction",
          value: "DEBIT",
          groupBy: "createdAt",
          interval: "month",
        },
      },
    ],
    chartType: "line",
  })

  const widget = res?.data ?? res
  if (!widget) return

  labels.value = (widget.labels ?? []).map((l: any) => clean(l))

  const revenue = widget.datasets?.find((d: any) => d.label === "Revenue")
  const expenses = widget.datasets?.find((d: any) => d.label === "Expenses")

  const combined = labels.value.map((label, i) => ({
    month: label,
    revenue: revenue?.data?.[i] ?? 0,
    expenses: expenses?.data?.[i] ?? 0,
  }))

  combined.sort((a, b) => monthOrder[a.month] - monthOrder[b.month])

  labels.value = combined.map(r => r.month)

  chartSeries.value = [
    {
      name: "Revenue",
      data: combined.map(r => r.revenue),
    },
    {
      name: "Expenses",
      data: combined.map(r => r.expenses),
    },
  ]

  isReady.value = true
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
    opacity: 1
  }

  50% {
    opacity: 0.4
  }
}
</style>