<template>
    <div class="chart-card">
        <div v-if="!isReady" class="skeleton-loader">
            Loading Student Gender Stats...
        </div>

        <client-only v-else>
            <ApexChart
                type="pie"
                height="350"
                :options="chartOptions"
                :series="chartSeries"
            />
        </client-only>
    </div>
</template>

<script setup lang="ts">
const store = useWidgetStore()
const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

const isReady = ref(false)

const labels = ref<string[]>([])
const chartSeries = ref<number[]>([])

const chartOptions = computed(() => ({
    chart: {
        id: 'student-gender',
        toolbar: { show: false }
    },
    title: {
        text: 'Student By Gender',
        align: 'left',
        style: { fontWeight: '600' }
    },
    labels: labels.value,
    colors: ['#EC4899', '#3B82F6'],
    legend: {
        position: 'bottom'
    }
}))

onMounted(async () => {

    const res = await store.runAnalytic({
        entity: "students",
        title: "Student By Gender",
        filters: [],
        metrics: [
            {
                name: "Gender",
                aggregation: "count",
                tags: {
                    field: "gender",
                    groupBy: "gender"
                }
            }
        ],
        chartType: "pie"
    })

    if (!res) return

    const widget = res

    labels.value = widget.labels.map((e: any) => parseGender[e])
    chartSeries.value = widget.datasets[0].data

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

  0%,
  100% {
    opacity: 1
  }

  50% {
    opacity: 0.4
  }
}
</style>