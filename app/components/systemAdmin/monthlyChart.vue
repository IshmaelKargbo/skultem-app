<script setup lang="ts">
// A small month-by-month column chart for the system admin dashboard.
const { labels, series, height = 240 } = defineProps<{
  labels: string[]
  series: { name: string, data: number[], color: string }[]
  height?: number
}>()

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

const options = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
  colors: series.map(s => s.color),
  plotOptions: { bar: { columnWidth: series.length > 1 ? '60%' : '45%', borderRadius: 4 } },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: { categories: labels, labels: { style: { fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  // Counts only - never show 0.5 of a school.
  yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) }, forceNiceScale: true, min: 0 },
  grid: { borderColor: 'var(--ui-border)', strokeDashArray: 4 },
  legend: { show: series.length > 1, position: 'bottom', fontSize: '12px' },
  tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => String(v) } }
}))
</script>

<template>
  <ClientOnly>
    <ChartScroll>
      <ApexChart type="bar" :height="height" :options="options" :series="series.map(s => ({ name: s.name, data: s.data }))" />
    </ChartScroll>
    <template #fallback>
      <USkeleton class="w-full" :style="{ height: `${height}px` }" />
    </template>
  </ClientOnly>
</template>
