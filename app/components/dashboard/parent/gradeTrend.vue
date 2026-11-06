<template>
  <UCard>
    <div>
      <ChartSkeleton v-if="!isReady" />
      <div v-else-if="!chartSeries.length" class="flex h-[350px] flex-col items-center justify-center gap-2 text-center">
        <UIcon name="lucide:bar-chart-3" class="size-8 text-muted" />
        <p class="text-sm font-semibold text-highlighted">Grade Trend</p>
        <p class="text-xs text-muted">No approved assessments yet.</p>
      </div>
      <client-only v-else>
        <template #fallback>
          <ChartSkeleton />
        </template>
        <ChartScroll>
          <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
        </ChartScroll>
      </client-only>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { id } = defineProps<{
  id: string
}>()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))
// Dark value labels (light on a dark card) instead of ApexCharts' default white.
const colorMode = useColorMode()
const labelColor = computed(() => colorMode.value === 'dark' ? '#f3f4f6' : '#111827')

const isReady = ref(false)
const labels = ref<string[]>([])
const colors = ref<string[]>([])
const chartSeries = ref<any[]>([])

const chartOptions = computed(() => ({
  chart: {
    id: "grade-trend",
    toolbar: { show: false }
  },
  title: {
    text: "Grade Trend",
    align: "left",
    style: { fontWeight: 600 }
  },
  subtitle: {
    text: "Average approved assessment score per term",
    align: "left",
    style: {
      fontSize: "12px",
      color: "#6b7280"
    }
  },
  xaxis: {
    categories: labels.value,
    labels: { style: { fontSize: "12px" } }
  },
  yaxis: {
    title: { text: "Average Score (%)" },
    labels: {
      formatter: (val: number) => `${Math.round(val)}%`
    }
  },

  colors: colors.value,

  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4
  },

  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: "45%",
      distributed: true,
      // Values sit just above each bar, where they read on any bar colour.
      dataLabels: { position: "top" }
    }
  },

  tooltip: {
    y: {
      formatter: (val: number) => `${Math.round(val)}%`
    }
  },

  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${Math.round(val)}%`,
    offsetY: -20,
    style: { fontWeight: 600, colors: [labelColor.value] }
  }
}))

async function loadData() {
  if (!id) return
  try {
    const payload = {
      entity: "assessments",
      title: "Class Performance",
      filters: [
        {
          field: "studentAssessment.enrollment.student.id",
          value: id,
          operator: "EQUALS",
          type: "select"
        },
        // Unmarked work comes back as 0 and would drag every term down.
        {
          field: "cycle.status",
          values: ['APPROVED', 'COMPLETED', 'LOCKED'],
          operator: "IN_LIST",
          type: "select"
        }
      ],
      metrics: [
        {
          name: "Average Score",
          aggregation: "avg",
          field: "score",
          tags: { groupBy: "term" }
        }
      ],
      chartType: "bar"
    }

    const res = await store.runAnalytic(payload)
    const widget = res?.data ?? res

    labels.value = widget?.labels ?? []
    colors.value = generateColors(labels.value.length)

    chartSeries.value = labels.value.length
      ? (widget?.datasets ?? []).map((d: any) => ({
        name: d.label,
        data: d.data.map((v: number) => Math.round(v))
      }))
      : []
  } catch (err) {
    console.error("Failed to load class performance", err)
    chartSeries.value = []
  } finally {
    // Always leave the loading state, otherwise an empty or failed response spins forever.
    isReady.value = true
  }
}

watch(
  () => id,
  async () => {
    isReady.value = false
    await loadData()
  },
  { immediate: true }
)
</script>
