<template>
  <UCard>
    <div>
      <div v-if="!isReady" class="skeleton-loader">
        Loading Grade Distribution...
      </div>

      <client-only v-else>
        <ApexChart type="bar" height="350" :options="chartOptions" :series="chartSeries" />
      </client-only>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const store = useWidgetStore()
const { term, classId, assessment, teacher } = defineProps<{
  term: string
  assessment: string,
  teacher: string | undefined,
  classId: string | undefined
}>()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const chartSeries = ref<any[]>([])

const chartOptions: any = computed(() => ({
  chart: {
    id: "grade-trend",
    toolbar: { show: false }
  },
  title: {
    text: "Grade Distribution",
    align: "left",
    style: { fontWeight: 600 }
  },
  subtitle: {
    text: "Grade distribution per subject",
    align: "left",
    style: {
      fontSize: "12px",
      color: "#6b7280"
    }
  },
  colors: ["#0e9bbe"],
  xaxis: {
    categories: labels.value,
    labels: { style: { fontSize: "12px" } }
  },
  yaxis: {
    title: { text: "Average Score" },
    labels: {
      formatter: (val: number) => val.toFixed(2)
    }
  },
  grid: {
    borderColor: "#f1f5f9",
    strokeDashArray: 4
  },
  tooltip: {
    y: {
      formatter: (val: number) => val.toFixed(0)
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: "45%"
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(0)
  }
}))

async function loadData() {
  try {
    const payload = {
      entity: "assessments",
      title: "Grade Distribution",
      filters: [
        {
          field: "studentAssessment.enrollment.clazz.id",
          value: classId,
          operator: "EQUALS",
          type: "select"
        },
        {
          field: "cycle.term.id",
          value: term,
          operator: "EQUALS",
          type: "select"
        },
        {
          field: "cycle.assessment.id",
          value: assessment,
          operator: "EQUALS",
          type: "select"
        },
        {
          field: "cycle.subject.id",
          value: teacher,
          operator: "EQUALS",
          type: "select"
        }
      ],
      metrics: [
        {
          name: "Grade Distribution",
          aggregation: "count",
          field: "grade",
          tags: {
            groupBy: "grade",
            field: "status",
            value: "APPROVED",
          }
        },
      ],
      chartType: "bar"
    }

    const res = await store.runAnalytic(payload)
    const widget = res?.data ?? res

    if (!widget?.labels || !widget?.datasets) return

    labels.value = widget.labels

    chartSeries.value = widget.datasets.map((d: any) => ({
      name: d.label,
      data: d.data
    }))

    isReady.value = true
  } catch (err) {
    console.error("Failed to load grade distribution", err)
  }
}

watch(
  () => [classId, term, assessment, teacher],
  async () => {
    isReady.value = false
    await loadData()
  },
  { immediate: true }
)
</script>

<style scoped>
.skeleton-loader {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0e87a5;
  font-weight: 500;
  background: #f3f4f6;
  border-radius: 0.5rem;
  animation: pulse 1.5s infinite;
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