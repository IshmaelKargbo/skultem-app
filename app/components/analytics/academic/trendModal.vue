<script setup lang="ts">
const props = defineProps<{
  open: boolean
  studentName: string
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const store = useAcademicReportStore()
const { trend, loadingTrend } = storeToRefs(store)

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

const trendLabel: Record<string, { text: string, color: 'success' | 'error' | 'neutral' | 'warning' }> = {
  IMPROVING: { text: 'Improving', color: 'success' },
  DECLINING: { text: 'Declining', color: 'error' },
  STABLE: { text: 'Stable', color: 'neutral' },
  INSUFFICIENT_DATA: { text: 'Not enough data yet', color: 'warning' }
}

const badge = computed(() => trend.value ? trendLabel[trend.value.trend] : null)

const chartOptions = computed(() => ({
  chart: { id: 'student-trend', toolbar: { show: false } },
  xaxis: { categories: trend.value?.points.map(p => p.label) || [] },
  colors: ['#7b2183'],
  grid: { borderColor: 'var(--app-border)', strokeDashArray: 4 },
  dataLabels: { enabled: true, formatter: (val: number) => `${val}%` },
  yaxis: { min: 0, max: 100 }
}))

const chartSeries = computed(() => [{
  name: 'Score',
  data: trend.value?.points.map(p => p.score) || []
}])
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <div>
            <h3 class="text-lg font-semibold">Performance Trend</h3>
            <p class="text-sm text-muted">{{ studentName }}</p>
          </div>
        </template>

        <div v-if="loadingTrend" class="space-y-3">
          <USkeleton class="h-6 w-32" />
          <USkeleton class="h-56 w-full" />
        </div>

        <div v-else-if="!trend || trend.points.length < 2" class="py-10 text-center text-sm text-muted">
          Not enough approved assessments yet to calculate a trend.
        </div>

        <template v-else>
          <UBadge v-if="badge" :color="badge.color" variant="subtle" class="mb-4">
            Performance trend: {{ badge.text }}
          </UBadge>

          <ClientOnly>
            <ApexChart type="line" height="260" :options="chartOptions" :series="chartSeries" />
          </ClientOnly>
        </template>

        <template #footer>
          <div class="flex justify-end">
            <UButton label="Close" variant="soft" @click="open = false" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
