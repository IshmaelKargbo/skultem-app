<template>
  <div v-if="!isReady" class="skeleton-loader">Loading At-Risk Students...</div>
  <client-only v-else>
    <ApexChart
      type="bar"
      :height="Math.max(300, labels.length * 55 + 100)"
      :options="chartOptions"
      :series="chartSeries"
    />
  </client-only>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from "vue"

const store     = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady     = ref(false)
const labels      = ref<string[]>([])
const chartSeries = ref<any[]>([])
const THRESHOLD   = 50  // at risk below 50%

const chartOptions = ref<any>({})

function buildOptions(cats: string[]) {
  return {
    chart: {
      id: "at-risk-students",
      toolbar: { show: false },
      fontFamily: "inherit"
    },
    title: {
      text: "Student Assessment Risk",
      align: "left",
      style: { fontSize: "15px", fontWeight: "600", color: "#111827" }
    },
    subtitle: {
      text: `Students below ${THRESHOLD}% are flagged as at risk`,
      align: "left",
      style: { fontSize: "12px", color: "#6b7280" }
    },
    colors: [({ value }: { value: number }) =>
      value < THRESHOLD ? "#E24B4A" : "#22C55E"
    ],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "50%",
        dataLabels: { position: "center" }
      }
    },
    xaxis: {
      categories: cats,
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: { fontSize: "11px", colors: "#6b7280" }
      },
      axisBorder: { show: false },
      axisTicks:  { show: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: "#374151" },
        maxWidth: 160
      }
    },
    annotations: {
      xaxis: [{
        x: THRESHOLD,
        borderColor: "#E24B4A",
        borderWidth: 2,
        strokeDashArray: 5,
        label: {
          text: `At risk · ${THRESHOLD}%`,
          borderColor: "#E24B4A",
          style: {
            color: "#fff",
            background: "#E24B4A",
            fontSize: "11px",
            fontWeight: "500",
            padding: { top: 4, bottom: 4, left: 8, right: 8 }
          }
        }
      }]
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } }
    },
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(1)}%` }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "12px",
        fontWeight: "500",
        colors: ["#fff"]
      },
      dropShadow: { enabled: false }
    },
    legend: { show: false }
  }
}

onMounted(async () => {
  const res = await store.runAnalytic({
    entity: "assessments",
    title: "Student Assessment Risk",
    filters: [],
    metrics: [
      {
        name: "Year Score",
        aggregation: "avgsum",       // ✅ sum per term, avg across terms
        field: "weightScore",
        tags: {
          groupBy: "student",
          subGroupBy: "term",        // ✅ sum within each term first
          orderBy: "Year Score",
          order: "asc"              // ✅ worst first
        }
      }
    ],
    chartType: "bar"
  })

  const widget = res?.data ?? res
  if (!widget) return

  if (Array.isArray(widget)) {
    labels.value      = widget.map((r: any) => r.student)
    chartSeries.value = [{
      name: "Year Score",
      data: widget.map((r: any) => parseFloat(Number(r["Year Score"]).toFixed(2)))
    }]
  } else {
    labels.value      = widget.labels
    chartSeries.value = widget.datasets.map((d: any) => ({
      name: d.label,
      data: d.data.map((v: number) => parseFloat(v.toFixed(2)))
    }))
  }

  chartOptions.value = buildOptions(labels.value)
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