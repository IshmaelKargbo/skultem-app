<template>
  <div>
    <div v-if="!isReady" class="skeleton-loader">Loading Expenses by Category...</div>
    <div v-else-if="!labels.length" class="empty-state">
      <UIcon name="i-lucide-bar-chart-3" class="text-4xl text-muted" />
      <p class="mt-2 text-sm text-muted">No expense data for this period yet.</p>
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
const colors = ref<string[]>([])

const chartOptions = computed(() => ({
  chart: {
    id: "expenses-by-category",
    toolbar: { show: false },
  },

  title: {
    text: title || "Expenses by Category",
    align: "left",
    style: { fontWeight: "600" },
  },

  xaxis: {
    categories: labels.value,
  },

  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: "55%",
      distributed: true
    }
  },

  grid: {
    borderColor: "var(--app-border)",
    strokeDashArray: 4,
  },
  colors: colors.value,

  dataLabels: {
    enabled: true,
    formatter: (val: number) => format(val),
    style: {
      fontSize: "11px",
    },
  },

  tooltip: {
    y: {
      formatter: (val: number) => format(val),
    },
  },

  legend: {
    show: false,
  },
}))

async function fetchRecord() {
  isReady.value = false

  const res = await store.runAnalytic({
    entity: "expenses",
    title: title || "Expenses by Category",
    filters: dateFilter ? [dateFilter] : [],
    metrics: [
      {
        field: "amount",
        aggregation: "sum",
        name: "Total",
        tags: {
          groupBy: "category",
        },
      },
    ],
    chartType: "bar",
  })

  const widget = res?.data ?? res
  if (!widget) return

  if (Array.isArray(widget)) {
    labels.value = widget.map((r: any) => r.category)
    colors.value = generateColors(labels.value.length)
    chartSeries.value = [
      {
        name: "Expenses",
        data: widget.map((r: any) => Number(r.Total ?? 0)),
      },
    ]
  } else {
    labels.value = widget.labels

    const dataset = widget.datasets?.[0]

    chartSeries.value = [
      {
        name: dataset?.label ?? "Expenses",
        data: dataset?.data ?? [],
      },
    ]
  }

  isReady.value = true
}


defineExpose({
  fetchRecord
})

watch(() => dateFilter, fetchRecord)

onMounted(async () => {
  await fetchRecord()
})
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