<template>
  <div class="chart-card">
    <!-- Show loader while fetching/processing data -->
    <div v-if="!isReady" class="skeleton-loader">
      Loading Attendance Stats...
    </div>
    <client-only v-else>
      <!-- Show chart when ready -->
      <ApexChart type="line" height="350" :options="chartOptions" :series="chartSeries" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
const store = useDashboardStore()
const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

const isReady = ref(false)
const weeklyStats = ref<{ day: string; rate: number }[]>([])
const chartSeries = computed(() => [
  {
    name: 'Rate',
    data: weeklyStats.value.map(d => d.rate)
  }
])

// Chart options
const chartOptions = computed(() => ({
  chart: {
    id: 'weekly-attendance',
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  colors: ['#10B981'],
  stroke: { curve: 'smooth', width: 4 },
  markers: { size: 6, hover: { size: 8 } },
  title: { text: 'Weekly Attendance Rate', align: 'left', style: { fontWeight: '600' } },
  xaxis: {
    categories: weeklyStats.value.map(d => d.day),
    axisTicks: { show: false }
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 4,
    title: { text: 'Rate', style: { color: '#6B7280' } },
    labels: { formatter: (val: number) => `${val}%` }
  },
  grid: { show: true, borderColor: '#F3F4F6' },
  tooltip: { y: { formatter: (val: number) => `${val}%` } }
}))

// Simulate API fetch with delay
onMounted(async () => {
  const res = await store.fetchAdminWeekly()
  if (res == null) return
  weeklyStats.value = res
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
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
</style>