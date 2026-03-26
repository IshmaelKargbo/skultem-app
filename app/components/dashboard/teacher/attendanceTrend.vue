<template>
  <UCard>
    <div class="chart-card">
      <div v-if="!isReady" class="skeleton-loader">
        Loading Attendance Trend...
      </div>

      <client-only v-else>
        <ApexChart type="area" height="350" :options="chartOptions" :series="chartSeries" />
      </client-only>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from "vue"

const store = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"))

const isReady = ref(false)
const labels = ref<string[]>([])
const chartSeries = ref<any[]>([])

const { classId } = defineProps<{
  classId: string | undefined
}>()

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

  colors: ["#22C55E", "#EF4444", "#F59E0B", "#3B82F6"],

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

async function fetchRecord() {
  const res = await store.runAnalytic({
    entity: "attendances",
    title: "Attendance Trend",
    filters: [
      {
        field: 'enrollment.clazz.id',
        value: classId,
        operator: 'EQUALS',
        type: 'select'
      }
    ],
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
        aggregation: "percentage",
        tags: {
          field: "state",
          value: "Absent",
          groupBy: "date",
          interval: "week"
        }
      },
      {
        name: "Late",
        aggregation: "percentage",
        tags: {
          field: "state",
          value: "Late",
          groupBy: "date",
          interval: "week"
        }
      },
      {
        name: "Excused",
        aggregation: "percentage",
        tags: {
          field: "state",
          value: "Excused",
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

  labels.value = widget.labels

  chartSeries.value = widget.datasets.map((d: any) => ({
    name: d.label,
    data: d.data
  }))

  isReady.value = true
}

watch(() => classId, async () => {
  await fetchRecord()
})
</script>

<style scoped>
.skeleton-loader {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #80766b;
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