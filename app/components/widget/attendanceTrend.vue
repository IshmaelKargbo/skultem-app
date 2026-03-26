<template>
  <div class="chart-card">
    <div v-if="!isReady" class="skeleton-loader">
      Loading Attendance Trend...
    </div>

    <client-only v-else>
      <ApexChart
        type="area"
        height="350"
        :options="chartOptions"
        :series="chartSeries"
      />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from "vue"

const store = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const chartSeries = ref<any[]>([])

function parseMonth(month: string) {
  const months: Record<string, string> = {
    JANUARY: "Jan",
    FEBRUARY: "Feb",
    MARCH: "Mar",
    APRIL: "Apr",
    MAY: "May",
    JUNE: "Jun",
    JULY: "Jul",
    AUGUST: "Aug",
    SEPTEMBER: "Sep",
    OCTOBER: "Oct",
    NOVEMBER: "Nov",
    DECEMBER: "Dec"
  }

  return months[month] ?? month
}

const chartOptions = computed(() => ({
  chart: {
    id: "attendance-trend",
    toolbar: { show: false },
    zoom: { enabled: false }
  },

  title: {
    text: "Attendance Trend",
    align: "left",
    style: { fontWeight: "600" }
  },

  stroke: {
    curve: "smooth",
    width: 3
  },

  colors: [
    "#22C55E", // Present
    "#EF4444"  // Absent
  ],

  markers: {
    size: 5
  },

  xaxis: {
    categories: labels.value
  },

  grid: {
    borderColor: "#f1f5f9"
  },

  legend: {
    position: "bottom"
  },

  tooltip: {
    shared: true
  }
}))
onMounted(async () => {

  const res = await store.runAnalytic({
    entity: "attendances",
    title: "Attendance Trend",
    filters: [],
    metrics: [
      { 
        name: "Present",
        aggregation: "percentage",
        tags: {
          field: "state",
          value: "Present",
          groupBy: "date",
          interval: "week"
        }
      },
      {
        name: "Absent",
        aggregation: "count",
        tags: {
          field: "state",
          value: "Absent",
          groupBy: "date",
          interval: "week"
        }
      }
    ],
    chartType: "line"
  })

  if (!res) return

  const widget = res?.data ?? res

  if (!widget?.labels) return

  labels.value = widget.labels.map((m: string) => parseMonth(m))

  chartSeries.value = widget.datasets.map((d:any) => ({
    name: d.label,
    data: d.data
  }))

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
  0%,100% { opacity: 1 }
  50% { opacity: 0.4 }
}
</style>