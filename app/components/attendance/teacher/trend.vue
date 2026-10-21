<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="font-semibold">Attendance Trend</p>
          <p class="text-xs-base text-muted">Staff attendance rate per day marked - watch it rise or slip over time</p>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="summary" class="hidden text-right sm:block">
            <p class="text-xs-base text-muted">Average</p>
            <p class="text-lg font-semibold leading-tight">{{ summary.average }}%</p>
          </div>
          <div v-if="summary" class="hidden text-right sm:block">
            <p class="text-xs-base text-muted">Change</p>
            <p class="text-lg font-semibold leading-tight"
              :class="summary.change >= 0 ? 'text-success-500' : 'text-error-500'">
              {{ summary.change >= 0 ? '+' : '' }}{{ summary.change }}%
            </p>
          </div>
          <USelectMenu v-model="range" value-key="value" label-key="label" :items="rangeOptions" class="w-60" />
        </div>
      </div>
    </template>

    <USkeleton v-if="loading" class="h-72 w-full" />

    <div v-else-if="!days.length"
      class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 dark:border-gray-700">
      <UIcon name="i-lucide-chart-area" class="mb-2 text-4xl text-muted" />
      <p class="font-medium">No attendance records yet</p>
      <p class="text-sm text-muted">The trend appears once attendance has been marked.</p>
    </div>

    <ClientOnly v-else>
      <ChartScroll>
        <ApexChart type="area" height="300" :options="chartOptions" :series="series" />
      </ChartScroll>
    </ClientOnly>
  </UCard>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const colorMode = useColorMode()

const rangeOptions = [
  { label: 'Last 14 school days', value: 14 },
  { label: 'Last 30 school days', value: 30 },
  { label: 'Last 60 school days', value: 60 },
  { label: 'Last 90 school days', value: 90 }
]
const range = ref(30)
const loading = ref(true)
const days = ref<TeacherAttendanceDaySummary[]>([])

// History is paged newest-first; the chart needs oldest-first. Fetched on its own (not through the
// store's `history`, which drives the 7-per-page list next to the register).
async function load() {
  loading.value = true
  try {
    const res = await TeacherAttendanceApi().history(1, range.value)
    const rows: TeacherAttendanceDaySummary[] = res?.data || []
    days.value = [...rows].sort((a, b) => a.date.localeCompare(b.date))
  } finally {
    loading.value = false
  }
}

watch(range, load)
onMounted(load)

// Reload after attendance is saved / clocked on the page.
defineExpose({ reload: load })

const summary = computed(() => {
  if (!days.value.length) return null
  const rates = days.value.map(d => d.rate)
  const average = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
  const change = Math.round(rates[rates.length - 1]! - rates[0]!)
  return { average, change }
})

const series = computed(() => [{ name: 'Attendance rate', data: days.value.map(d => d.rate) }])

const chartOptions = computed(() => {
  const dark = colorMode.value === 'dark'
  return {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent', fontFamily: 'inherit' },
    theme: { mode: dark ? 'dark' : 'light' },
    colors: ['#22C55E'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 95, 100] } },
    dataLabels: { enabled: false },
    markers: { size: days.value.length <= 31 ? 4 : 0, hover: { size: 6 } },
    xaxis: {
      categories: days.value.map(d => d.date),
      type: 'category',
      tickAmount: Math.min(days.value.length - 1, 8),
      labels: {
        rotate: 0,
        formatter: (v: string) => {
          const d = new Date(`${v}T00:00:00`)
          return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { min: 0, max: 100, tickAmount: 5, labels: { formatter: (v: number) => `${Math.round(v)}%` } },
    grid: { borderColor: dark ? '#374151' : '#E5E7EB', strokeDashArray: 4 },
    annotations: {
      yaxis: [{ y: 80, borderColor: '#F59E0B', strokeDashArray: 4, label: { text: '80% target', style: { color: '#fff', background: '#F59E0B' } } }]
    },
    tooltip: {
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const d = days.value[dataPointIndex]
        if (!d) return ''
        const label = new Date(`${d.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
        return `<div style="padding:8px 12px;font-size:12px;line-height:1.6">
          <div style="font-weight:600">${label}</div>
          <div>Rate: <b>${d.rate}%</b></div>
          <div style="color:#22C55E">Present: ${d.presentCount}</div>
          <div style="color:#F59E0B">Late: ${d.lateCount}</div>
          <div style="color:#EF4444">Absent: ${d.absentCount}</div>
          <div style="color:#3B82F6">Excused: ${d.excusedCount}</div>
        </div>`
      }
    }
  }
})
</script>
