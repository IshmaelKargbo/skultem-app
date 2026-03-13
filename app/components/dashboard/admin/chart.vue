<template>
  <client-only>
    <component
      v-if="chartData && chartData.labels && chartData.labels.length"
      :is="resolvedChartType"
      :chart-data="chartData"
      :chart-options="chartOptions"
    />
  </client-only>
</template>

<script setup>
import { computed } from 'vue'
import { Line, Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
)

const props = defineProps({
  chartType: { type: String, default: 'Line' }, // 'Line', 'Bar', 'Pie'
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, default: () => ({ responsive: true }) }
})

const chartMap = { Line, Bar, Pie }

const resolvedChartType = computed(() => chartMap[props.chartType] || Line)
</script>