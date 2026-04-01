<template>
  <div>
    <div v-if="!isReady" class="skeleton-loader">Loading Expenses by Category...</div>

    <client-only v-else>
      <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
const { format } = useMoney()
const store = useWidgetStore()

const { title } = defineProps<{
  title?: string
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
    borderColor: "#f1f5f9",
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
  const res = await store.runAnalytic({
    entity: "expenses",
    title: title || "Expenses by Category",
    filters: [],
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
  color: #6b7280;
  font-weight: 500;
  background: #f3f4f6;
  border-radius: 0.5rem;
  animation: pulse 1.5s infinite;
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